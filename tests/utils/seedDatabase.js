import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../src/prisma'

const password = 'Red0987654'

const userOne = {
  input: {
    name: 'Jen',
    email: 'jen@example.com',
    password: bcrypt.hashSync(password),
    signupType: 'EMAIL'
  },
  user: undefined,
  jwt: undefined
}

const userTwo = {
  input: {
    name: 'Mario',
    email: 'mario@example.com',
    password: bcrypt.hashSync(password),
    signupType: 'EMAIL'
  },
  user: undefined,
  jwt: undefined
}

const userThree = {
  input: {
    name: 'Alex',
    email: 'alex@example.com',
    password: bcrypt.hashSync(password),
    signupType: 'EMAIL'
  },
  user: undefined,
  jwt: undefined
}

const googleAuthProvider = {
  input: {
    type: 'GOOGLE',
    userId: 'userIdFromGoogle',
    token: 'tokenFromGoogle'
  },
  authProvider: undefined
}

const facebookAuthProvider = {
  input: {
    type: 'FACEBOOK',
    userId: 'userIdFromFacebook',
    token: 'tokenFromFacebook'
  },
  authProvider: undefined
}

const seedDatabase = async () => {
  // Delete test data
  await prisma.mutation.deleteManyAuthProviders()
  await prisma.mutation.deleteManyUsers()

  // Create user one
  userOne.user = await prisma.mutation.createUser({
    data: userOne.input
  })
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)
  
  // Create user two
  userTwo.user = await prisma.mutation.createUser({
    data: userTwo.input
  })
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)

  // Create user three
  userThree.user = await prisma.mutation.createUser({
    data: userThree.input
  })
  userThree.jwt = jwt.sign({ userId: userThree.user.id }, process.env.JWT_SECRET)

  // Create GOOGLE auth provider for userOne
  googleAuthProvider.authProvider = await prisma.mutation.createAuthProvider({
    data: {
      ...googleAuthProvider.input,
      user: {
        connect: {
          id: userOne.user.id
        }
      }
    }
  })

  // Create FACEBOOK auth provider for userTwo
  facebookAuthProvider.authProvider = await prisma.mutation.createAuthProvider({
    data: {
      ...facebookAuthProvider.input,
      user: {
        connect: {
          id: userTwo.user.id
        }
      }
    }
  })

}

export { seedDatabase as default, userOne, userTwo, userThree, password, googleAuthProvider, facebookAuthProvider }