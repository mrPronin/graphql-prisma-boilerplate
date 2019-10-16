import { GraphQLServer, PubSub } from 'graphql-yoga'
import photon from './photon'
import { resolvers, fragmentReplacements } from './resolvers/index'

// deubg
import {
    hashPassword,
    getUserBySocialMediaId,
    getAuthProviderForUser,
    updateUserWithPicture,
    getUserById,
    createUserWithData,
    deleteUser
} from './utils/user'

async function test_createUserWithData() {
    const data = {
        name: '20190929_01',
        email: '20190929_01@example.com',
        password: '12345678',
        signupType: 'GOOGLE',
        authProviders: {
            create: [
                {
                    type: 'GOOGLE',
                    userId: 'GOOGLE_20190929_01_userId',
                    token: 'GOOGLE_20190929_01_token'
                }
            ]
        }
    }
    const user = await createUserWithData(data)
    console.log(`user: ${JSON.stringify(user, undefined, 2)}`)
}

async function updateUser() {
    // const hashedPassword = await hashPassword('12345678')
    // console.log(`hashedPassword: ${JSON.stringify(hashedPassword, undefined, 2)}`)
    const user = await photon.users.update({
        where: {
            id: 'ck15bp1q00000w49e45zl1svn'
        },
        data: {
            password: await hashPassword('12345678'),
            signupType: 'GOOGLE'
        },
        include: {
            authProviders: true
        }
    })    
    console.log(`user: ${JSON.stringify(user, undefined, 2)}`)
}

async function authProviders() {
    const providers = await photon.authProviders.findMany({
        include: {
            user: true
        }
    })
    console.log(`providers: ${JSON.stringify(providers, undefined, 2)}`)
}

async function deleteAuthProviders() {
    const deletedCount = await photon.authProviders.deleteMany()
    console.log(`deletedCount: ${JSON.stringify(deletedCount, undefined, 2)}`)
}

async function users() {
    const users = await photon.users.findMany({
        include: {
            authProviders: true
        }
    })
    console.log(`users: ${JSON.stringify(users, undefined, 2)}`)
}

async function testGetUserBySocialMediaId(userId, type) {
    const user = await getUserBySocialMediaId('GOOGLE_20190929_01_userId', 'GOOGLE')
    console.log(`result: ${JSON.stringify(user, undefined, 2)}`)
    /*
    const providers = await photon.authProviders.findMany({
        select: {
            user: {
                select: {
                    id: true
                }
            }
        },
        where: {
            AND: [
                { type: type },
                { userId: userId }
            ]
        }
      })
    console.log(`providers: ${JSON.stringify(providers, undefined, 2)}`)
    */
}

async function testGetAuthProviderForUser(id, type) {
    const result = await getAuthProviderForUser(id, type)
    console.log(`result: ${JSON.stringify(result, undefined, 2)}`)

    /*
    const providers = await photon.users.findOne({ where: { id } })
    .authProviders({ where: { type } })
    console.log(`result: ${JSON.stringify(providers, undefined, 2)}`)
    */
}

async function test_updateUserWithPicture(id, picture) {
    const user = await getUserById(id)
    await updateUserWithPicture(user, picture)
}

async function test_deleteUser() {
    const userName = '20191015_02'
    const signupType = 'GOOGLE'
    const data = {
        name: userName,
        email: `${userName}@example.com`,
        password: '12345678',
        signupType: signupType,
        authProviders: {
            create: [
                {
                    type: signupType,
                    userId: `${signupType}_${userName}_userId`,
                    token: `${signupType}_${userName}_token`
                }
            ]
        }
    }
    const user = await createUserWithData(data)
    await users()
    // console.log(`user: ${JSON.stringify(user, undefined, 2)}`)
    // const deletedUser = await deleteUser(user.id)
    // console.log(`deletedUser: ${JSON.stringify(deletedUser, undefined, 2)}`)
}

async function deleteUsers() {
    const deletedCount = await photon.users.deleteMany()
    console.log(`deletedCount: ${JSON.stringify(deletedCount, undefined, 2)}`)
}
// updateUser()
// authProviders()
// users()
// testGetUserBySocialMediaId('GOOGLE_20190929_01_userId', 'GOOGLE')
// testGetAuthProviderForUser('ck15bp1q00000w49e45zl1svn', 'GOOGLE')
// test_updateUserWithPicture('ck15bp1q00000w49e45zl1svn', 'test_picture_name.png')
// test_createUserWithData()
// test_deleteUser()
// deleteAuthProviders()
// deleteUsers()

// debug

const pubsub = new PubSub()

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context(request, response) {
        return {
            pubsub,
            photon,
            request,
            response
        }
    },
    fragmentReplacements
})

export { server as default }