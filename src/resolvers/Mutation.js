import _ from 'lodash'
import bcrypt from 'bcryptjs'

import { errorEmailTaken, errorUnableToLogin, errorUserNotFound } from '../utils/errors'
import {
    generateToken, 
    hashPassword,
    createUserWithData,
    deleteUser,
    getUserId, 
    getUserByEmail,
    continueWithAuthProvider
} from '../utils/user'

import { authenticateFacebook, authenticateGoogle } from '../services/auth'

const Mutation = {
    async createUser(parent, args, {
        prisma
    }, info) {
        const existingUser = await getUserByEmail(args.data.email)
        if (existingUser) {
            throw errorEmailTaken()
        }
        const password = await hashPassword(args.data.password)

        // Create new user
        const data = {
            ...args.data,
            password,
            signupType: 'EMAIL'
        }
        const user = await createUserWithData(data)

        return {
            user,
            token: generateToken(user.id)
        }
    },
    async login(parent, args, { prisma }, info) {
        const { password, email } = args.data
        if (!password || 0 === password.length) {
            throw errorUnableToLogin()
        }
        
        const user = await getUserByEmail(email.toLowerCase())

        if (!user) {
            throw errorUnableToLogin()
        }
        if (_.isEmpty(user.password) || !_.isString(user.password)) {
            throw errorUnableToLogin()
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw errorUnableToLogin()
        }

        return {
            user,
            token: generateToken(user.id)
        }
    },
    async deleteUser(parent, args, { prisma, request }, info) {
        
        const userExists = await prisma.exists.User({ id: args.id })
        if (!userExists) {
            throw errorUserNotFound()
        }
        
       const userId = getUserId(request)
       return deleteUser(userId, info)
    },
    async updateUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        if (typeof args.data.password === 'string') {
            args.data.password = await hashPassword(args.data.password)
        }

        return prisma.mutation.updateUser({
            where: {
                id: userId
            },
            data: args.data
        }, info)
    },
    async continueWithGoogle(parent, args, { request, response }) {

        const { accessToken, refreshToken } = args.data
        const payload = await authenticateGoogle(accessToken)
        const userData = {
            userId: payload.sub,
            email: payload.email,
            picture: payload.picture,
            name: payload.given_name,
            lastName: payload.family_name
        }
        return await continueWithAuthProvider('GOOGLE', userData, refreshToken)
    },
    async continueWithFacebook(parent, args, { request, response }, info) {
        const { accessToken, refreshToken } = args.data
        const payload = await authenticateFacebook(accessToken, request, response)
        const userData = {
            ...payload
        }
        return await continueWithAuthProvider('FACEBOOK', userData, payload.accessToken)
}
}

export { Mutation as default }