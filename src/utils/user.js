import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../prisma'
import sgMail from '../services/mailer'
import {
  errorIncorrectPasswordLength, 
  errorAuthenticationRequired,
  errorAuthProviderTypeIsEmpty,
  errorUserDataIsEmpty,
  errorTokenIsEmpty,
  errorUserIdIsEmpty,
  errorUnableToDeleteUser
} from './errors'

const isValidPassword = (password) => {
  return password.length >= 8 && !password.toLowerCase().includes('password')
}

const generateToken = (userId) => {
  // return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7 days' })
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + 60)
  return jwt.sign({
    userId,
    exp: parseInt(expirationDate.getTime() / 1000, 10)
  }, process.env.JWT_SECRET)
  
}

const hashPassword = (password) => {
  if (password.length < 8) {
    throw errorIncorrectPasswordLength()
  }
  return bcrypt.hash(password, 10)
}

const getUserId = (request, requireAuth = true) => {
  const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization

  if (header) {
    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  }
  if (requireAuth) {
    throw errorAuthenticationRequired()
  }
  return null
}

const getUserBySocialMediaId = async (userId, type) => {
  if (!userId || 0 === userId.length) return null
  if (!type || 0 === type.length) return null

  const providers = await prisma.query.authProviders({
      where: {
          AND: [
              { type: type },
              { userId: userId }
          ]
      }
  }, `
       {
           id
           user {
               id
           }
       }
  `)

  if (providers.length === 0) return null

  const user = await prisma.query.user({
      where: {
          id: providers[0].user.id
      }
  })

  return {
      user,
      provider: providers[0]
  }
}

const getUserByEmail = async (email) => {

  if (!email || 0 === email.length) return null
  
  const users = await prisma.query.users({
      where: {
          email: email
      }
  })
  if (users.length === 0) return null

  return users[0]
}

const getUserById = async (id) => {
    if (_.isEmpty(id) || !_.isString(id)) return

    const users = await prisma.query.users({
        where: {
            id
        }
    })
    if (users.length === 0) return null

    return users[0]
}

const getAuthProviderForUser = async (id, type) => {
  if (!id || 0 === id.length) return null
  if (!type || 0 === type.length) return null

  const providers = await prisma.query.authProviders({
      where: {
          AND: [
              { type: type },
              {
                  user: {
                      id: id
                  }
              }
          ]
      }
  }, `
       {
           id
       }
  `)

  if (providers.length === 0) return null

  return providers[0]
}

const continueWithAuthProvider = async (providerType, userData, token) => {
    if (_.isEmpty(providerType) || !_.isString(providerType)) throw errorAuthProviderTypeIsEmpty()
    if (_.isEmpty(userData)) throw errorUserDataIsEmpty()
    if (_.isEmpty(token) || !_.isString(token)) throw errorTokenIsEmpty()
    const {
        userId,
        email,
        picture,
    } = userData
    if (_.isEmpty(userId) || !_.isString(userId)) throw errorUserIdIsEmpty()

    // Check if user exists by google userId
    const result = await getUserBySocialMediaId(userId, providerType)
    if (result) {
        const {
            user: userBySocialMediaId,
            provider: authProvider
        } = result
        await updateUserWithPicture(userBySocialMediaId, picture)
        // Update auth provider with Google token received from client
        await prisma.mutation.updateAuthProvider({
            data: {
                token: token
            },
            where: {
                id: authProvider.id
            }
        })

        return {
            user: userBySocialMediaId,
            token: generateToken(userBySocialMediaId.id)
        }
    }

    // Check if user exists by email
    if (!_.isEmpty(email) && _.isString(email)) {
        const userByEmail = await getUserByEmail(email.toLowerCase())
        if (userByEmail) {
            await updateUserWithPicture(userByEmail, picture)
            // User exists
            const authProvider = await getAuthProviderForUser(userByEmail.id, providerType)
            if (authProvider) {
                // User has connected GOOGLE auth provider
                await prisma.mutation.updateAuthProvider({
                    data: {
                        userId,
                        token: token
                    },
                    where: {
                        id: authProvider.id
                    }
                })
            } else {
                // Create auth provider for user
                await prisma.mutation.createAuthProvider({
                    data: {
                        type: providerType,
                        userId,
                        token: token,
                        user: {
                            connect: {
                                id: userByEmail.id
                            }
                        }
                    }
                })
            }
            return {
                user: userByEmail,
                token: generateToken(userByEmail.id)
            }
        }
    }

    // Create new user
    const newUserData = {
        ...userData,
        password: '',
        signupType: providerType
    }
    const user = await createUserWithData(newUserData)

    // Create auth provider for user
    await prisma.mutation.createAuthProvider({
        data: {
            type: providerType,
            userId,
            token: token,
            user: {
                connect: {
                    id: user.id
                }
            }
        }
    })

    return {
        user,
        token: generateToken(user.id)
    }
}

const deleteUser = async (id, info, followUpEmailEnabled = false) => {
    const user = await getUserById(id)
    if (!user) {
        throw errorUnableToDeleteUser()
    }
    if (followUpEmailEnabled) {
        sendFollowUpEmail(user.email, user.name)
    }
    return prisma.mutation.deleteUser({
        where: {
            id
        }
    }, info)
}

const createUserWithData = async (userData, welcomeEmailEnabled = false) => {
    const { name, email, password, lastName, picture, signupType } = userData
    const newUserData = {}
    // name
    if (!_.isEmpty(name) && _.isString(name)) {
        newUserData.name = name
    }

    // update email
    if (!_.isEmpty(email) && _.isString(email)) {
        newUserData.email = email.toLowerCase()
    }

    // password
    if (!_.isEmpty(password) && _.isString(password)) {
        newUserData.password = password
    }

    // lastName
    if (!_.isEmpty(lastName) && _.isString(lastName)) {
        newUserData.lastName = lastName
    }

    // picture
    if (!_.isEmpty(picture) && _.isString(picture)) {
        newUserData.picture = picture
    }

    // signupType
    if (!_.isEmpty(signupType) && _.isString(signupType)) {
        newUserData.signupType = signupType
    }

    const user =  await prisma.mutation.createUser({
        data: {
            ...newUserData
        }
    })
    if (welcomeEmailEnabled) {
        sendWelcomeEmail(user)
    }
    return user
}

const sendWelcomeEmail = (user) => {
    if (process.env.NODE_ENV === 'test') return
    const { email, name } = user
    if (_.isEmpty(email) || !_.isString(email)) return
    const mailData = {
        to: email,
        from: 'pronin.alx@gmail.com',
        subject: 'Welcome to the boilerplate!',
        text: `Welcome to the boilerplate, ${name}. Let me know how you get alone with the app.`
    }
    console.log(`Sent email with data: ${JSON.stringify(mailData, undefined, 2)}`)
    try {
        sgMail.send(mailData)
        // const result = sgMail.send(mailData)
        // console.log(`result: ${JSON.stringify(result, undefined, 2)}`)
    } catch (err) {
        console.log(err)
    }
 }

 const sendFollowUpEmail = (email, name) => {
    if (process.env.NODE_ENV === 'test') return
    if (_.isEmpty(email) || !_.isString(email)) return
    if (_.isEmpty(name) || !_.isString(name)) return
    const mailData = {
        to: email,
        from: 'pronin.alx@gmail.com',
        subject: 'Follow up email from boilerplate',
        text: `Bye from the boilerplate, ${name}.`
    }
    console.log(`Sent email with data: ${JSON.stringify(mailData, undefined, 2)}`)
    try {
        sgMail.send(mailData)
        // const result = sgMail.send(mailData)
        // console.log(`result: ${JSON.stringify(result, undefined, 2)}`)
    } catch (err) {
        console.log(err)
    }
}

// Private

const updateUserWithPicture = async (user, picture) => {
  if (!(typeof picture === 'string' && picture.length)) { return }
  if (typeof user.picture === 'string' && user.picture.length) { return }
  await prisma.mutation.updateUser({
      where: {
          id: user.id
      },
      data: {
          picture
      }
  })
}

export {
  isValidPassword, 
  generateToken, 
  hashPassword, 
  getUserId,
  createUserWithData,
  deleteUser,
  getUserBySocialMediaId, 
  getUserByEmail,
  getAuthProviderForUser,
  continueWithAuthProvider,
  sendWelcomeEmail,
  sendFollowUpEmail
}