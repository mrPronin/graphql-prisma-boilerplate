/*
import '@babel/polyfill'
import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, { userOne, userTwo, userThree, password, googleAuthProvider, facebookAuthProvider } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { createUser, login, getUsers, getProfile } from './utils/operations'
import {
  getUserBySocialMediaId, 
  getUserByEmail,
  getAuthProviderForUser,
  continueWithAuthProvider
} from '../src/utils/user'
import { authenticateGoogle } from '../src/services/auth'

import {
  errorTokenIsEmpty, 
  errorEmailTaken, 
  errorAuthProviderTypeIsEmpty,
  errorUserDataIsEmpty,
  errorUserIdIsEmpty
} from '../src/utils/errors'

jest.setTimeout(30000)

const client = getClient()

beforeEach(seedDatabase)

afterAll(async () => {
  await prisma.mutation.deleteManyAuthProviders()
  await prisma.mutation.deleteManyUsers()
})

*/

describe('User: ', () => {
  it('mock test', () => {
    expect(true).toBe(true)
  })

  /*
  it('should create (register) a new user', async () => {
    const variables = {
      data: {
        name: 'Test',
        email: 'test@test.com',
        password: 'green12345'
      }
    }
  
    const response = await client.mutate({
      mutation: createUser,
      variables
    })

    // console.log(`response: ${JSON.stringify(response, undefined, 2)}`)
  
    const exists = await prisma.exists.User({
      id: response.data.createUser.user.id
    })
  
    expect(exists).toBe(true)
  
  })
  
  it('should not login with bad credentials', async () => {
    const variables = {
      data: {
        email: userOne.input.email,
        password: "asldjfasjf"
      }
    }
    await expect(
      client.mutate({ mutation: login, variables })
    ).rejects.toThrow()
  })
  
  it('should not signup user with invalid password', async () => {
    const variables = {
      data: {
        name: 'Oleksandr',
        email: 'oleksandr@example.com',
        password: 'pass'
      }
    }
  
    await expect(
      client.mutate({ mutation: createUser, variables })
    ).rejects.toThrow()
  })
  
  it('should fetch own account (authorised)', async () => {
    const client = getClient(userOne.jwt)
    const {data} = await client.query({ query: getProfile })
    expect(data.me.id).toBe(userOne.user.id)
    expect(data.me.name).toBe(userOne.user.name)
    expect(data.me.email).toBe(userOne.user.email)
  })

  it('should login with right credentials', async () => {
    const variables = {
      data: {
        email: userOne.input.email,
        password: password
      }
    }

    const response = await client.mutate({ mutation: login, variables })
    expect(response.data.login.user.id).toBe(userOne.user.id)
  })

  it('should fail to register user with existing email', async () => {
    const variables = {
      data: {
        name: 'Test',
        email: 'test@example.com',
        password: 'green12345'
      }
    }
    await client.mutate({mutation: createUser, variables})
    await expect(
      client.mutate({mutation: createUser, variables})
    ).rejects.toThrow(errorEmailTaken().message)
  })
  */
})

/*
describe('getUserByEmail:', () => {

  it('should return user', async () => {
    // console.log(`userOne: ${JSON.stringify(userOne, undefined, 2)}`)
    const user = await getUserByEmail(userOne.user.email)
    expect(user.email).toBe(userOne.user.email)
  
  })

  it('should return null for empty email', async () => {
    const user = await getUserByEmail('')
    expect(user).toBeNull()
  })

  it('should return null for wrong email', async () => {
    const user = await getUserByEmail('abc')
    expect(user).toBeNull()
  })
})

describe('getUserBySocialMediaId', () => {
  it('should return user with userId and auth privider type GOOGLE', async () => {
    const { userId, type } = googleAuthProvider.input
    const result = await getUserBySocialMediaId(userId, type)
    const { user } = result
    expect(user.id).toBe(userOne.user.id)
  })

  it('should return user with userId and auth privider type FACEBOOK', async () => {
    const { userId, type } = facebookAuthProvider.input
    const { user } = await getUserBySocialMediaId(userId, type)
    expect(user.id).toBe(userTwo.user.id)
  })

  it('should return null for empty userId', async () => {
    const user = await getUserBySocialMediaId(null, 'randomValue')
    expect(user).toBeNull()
  })

  it('should return null for empty auth provider type', async () => {
    const result = await getUserBySocialMediaId('randomValue', '')
    expect(result).toBeNull()
  })

  it('should throw an error for wrong auth provider type', async () => {
    await expect(
      getUserBySocialMediaId('randomValue', 'WRONG')
    ).rejects.toThrow()
  })

  it('should return null if user with GOOGLE auth provider type and userId not exists', async () => {
    const result = await getUserBySocialMediaId('userIdNotExists', 'GOOGLE')
    expect(result).toBeNull()
  })

  it('should return null if user with FACEBOOK auth provider type and userId not exists', async () => {
    const result = await getUserBySocialMediaId('userIdNotExists', 'FACEBOOK')
    expect(result).toBeNull()
  })
})

describe('getAuthProviderForUser', () => {
  it('should return auth provider with user id and auth provider type GOOGLE', async () => {
    const { type } = googleAuthProvider.input
    const authProvider = await getAuthProviderForUser(userOne.user.id, type)
    // console.log(`authProvider: ${JSON.stringify(authProvider, undefined, 2)}`)
    expect(authProvider.id).toBe(googleAuthProvider.authProvider.id)
  })

  it('should return auth provider with user id and auth provider type FACEBOOK', async () => {
    const { type } = facebookAuthProvider.input
    const authProvider = await getAuthProviderForUser(userTwo.user.id, type)
    // console.log(`authProvider: ${JSON.stringify(authProvider, undefined, 2)}`)
    expect(authProvider.id).toBe(facebookAuthProvider.authProvider.id)
  })

  it('should return null for empty user id', async () => {
    const authProvider = await getAuthProviderForUser(null, 'randomValue')
    expect(authProvider).toBeNull()
  })

  it('should return null for empty auth provider type', async () => {
    const authProvider = await getAuthProviderForUser('randomValue', null)
    expect(authProvider).toBeNull()
  })

  it('should throw an error for wrong auth provider type', async () => {
    await expect(
      getAuthProviderForUser('randomValue', 'WRONG')
    ).rejects.toThrow()
  })

  it('should return null when GOOGLE auth provider not exists for the user', async () => {
    const { type } = googleAuthProvider.input
    const authProvider = await getAuthProviderForUser(userTwo.user.id, type)
    expect(authProvider).toBeNull()
  })

  it('should return null when FACEBOOK auth provider not exists for the user', async () => {
    const { type } = facebookAuthProvider.input
    const authProvider = await getAuthProviderForUser(userOne.user.id, type)
    expect(authProvider).toBeNull()
  })
})

describe('continueWithAuthProvider', () => {
  it('should raise an error if Google idToken empty', async () => {
    const refreshToken = 'refreshTokenValue'
    await expect(
      authenticateGoogle(null)
    ).rejects.toThrow(errorTokenIsEmpty().message)
  })

  it('should raise an error if provider type empty', async () => {
    const providerType = null
    const userData = {
      userId: 'userId'
    }
    const token = 'accessToken'
    await expect(
      continueWithAuthProvider(providerType, userData, token)
    ).rejects.toThrow(errorAuthProviderTypeIsEmpty().message)
  })

  it('should raise an error if user data empty', async () => {
    const { type: providerType } = googleAuthProvider.input
    const userData = {}
    const token = 'accessToken'
    await expect(
      continueWithAuthProvider(providerType, userData, token)
    ).rejects.toThrow(errorUserDataIsEmpty().message)
  })

  it('should raise an error if token is empty', async () => {
    const { type: providerType } = googleAuthProvider.input
    const userData = {
      userId: 'userId'
    }
    const token = null
    await expect(
      continueWithAuthProvider(providerType, userData, token)
    ).rejects.toThrow(errorTokenIsEmpty().message)
  })

  it('should raise an error if user id is empty', async () => {
    const { type: providerType } = googleAuthProvider.input
    const userData = {
      userId: null
    }
    const token = 'accessToken'
    await expect(
      continueWithAuthProvider(providerType, userData, token)
    ).rejects.toThrow(errorUserIdIsEmpty().message)
  })

  it('should return user if user with Google id exists and update auth provider with refresh token', async () => {
    const { userId, type: providerType } = googleAuthProvider.input
    const userData = {
      userId,
      email: 'test@example.com'
    }
    const token = 'refreshTokenValue'
    const { user } = await continueWithAuthProvider(providerType, userData, token)
    expect(user).not.toBeNull()
    expect(user.id).toBe(userOne.user.id)
    const [ authProvider ] = await prisma.query.authProviders({
      where: {
        AND: [{
            type: providerType
          },
          {
            user: {
              id: user.id
            }
          }
        ]
      }
    }, `
       {
           id
           token
       }
    `)
    expect(authProvider.token).toBe(token)
  })

  it('should return user if user with Facebook id exists and update auth provider with refresh token', async () => {
    const { userId, type: providerType } = facebookAuthProvider.input
    const userData = {
      userId,
      email: 'test@example.com'
    }
    const token = 'refreshTokenValue'
    const { user } = await continueWithAuthProvider(providerType, userData, token)
    expect(user).not.toBeNull()
    expect(user.id).toBe(userTwo.user.id)
    const [ authProvider ] = await prisma.query.authProviders({
      where: {
        AND: [{
            type: providerType
          },
          {
            user: {
              id: user.id
            }
          }
        ]
      }
    }, `
       {
           id
           token
       }
    `)
    expect(authProvider.token).toBe(token)
  })

  it('should return user if user with email exists and create auth provider', async () => {
    const { type: providerType } = googleAuthProvider.input
    const userData = {
      userId: 'userId',
      email: userThree.user.email
    }
    const token = 'refreshTokenValue'
    const { user } = await continueWithAuthProvider(providerType, userData, token)
    expect(user).not.toBeNull()
    expect(user.email).toBe(userThree.user.email)
    const [ authProvider ] = await prisma.query.authProviders({
      where: {
        AND: [{
            type: providerType
          },
          {
            user: {
              id: user.id
            }
          }
        ]
      }
    }, `
       {
           id
           token
       }
    `)
    expect(authProvider).not.toBeNull()
    expect(authProvider.token).toBe(token)
  })

  it('should create new user and create auth provider', async () => {
    const { type: providerType } = googleAuthProvider.input
    const userData = {
      userId: 'userId',
      email: 'new_user@example.com'
    }
    const token = 'refreshTokenValue'
    const { user } = await continueWithAuthProvider(providerType, userData, token)
    expect(user).not.toBeNull()
    expect(user.email).toBe(userData.email)
    const [ authProvider ] = await prisma.query.authProviders({
      where: {
        AND: [{
            type: providerType
          },
          {
            user: {
              id: user.id
            }
          }
        ]
      }
    }, `
       {
           id
           token
       }
    `)
    expect(authProvider).not.toBeNull()
    expect(authProvider.token).toBe(token)
  })
})
*/

// continueWithAuthProvider
// - should raise an error if auth provider incorrect

// User
// - should delete user with correct id
// - should raise an error when deletion user with incorrect id
// - should not fetch account data (not authorised)
// - should update account data (authorised)
// - should delete own account (authorised)
// - should login with correct credentials