import { GraphQLServer, PubSub } from 'graphql-yoga'
import photon from './photon'
import { resolvers, fragmentReplacements } from './resolvers/index'

// deubg
import {
    hashPassword,
    getUserBySocialMediaId,
    getAuthProviderForUser,
    updateUserWithPicture,
    getUserById
} from './utils/user'

async function createUser() {
    const user = await photon.users.create({
        data: {
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
    })
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

// updateUser()
// authProviders()
// users()
// testGetUserBySocialMediaId('GOOGLE_20190929_01_userId', 'GOOGLE')
// testGetAuthProviderForUser('ck15bp1q00000w49e45zl1svn', 'GOOGLE')
// test_updateUserWithPicture('ck15bp1q00000w49e45zl1svn', 'test_picture_name.png')

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