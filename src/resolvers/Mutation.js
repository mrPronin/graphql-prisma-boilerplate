import _ from 'lodash'
import bcrypt from 'bcryptjs'

import { errorUnableToLogin, errorUserNotFound } from '../utils/errors'
import {
    generateToken, 
    hashPassword,
    createUserWithData,
    updateUser,
    deleteUser,
    getUserId,
    existsUser,
    getUserByEmail,
    continueWithAuthProvider
} from '../utils/user'

import { authenticateFacebook, authenticateGoogle } from '../services/auth'

const Mutation = {
    async createUser(parent, args, { photon }, info) {
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
    async login(parent, args, { photon }, info) {
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
    async deleteUser(parent, args, { request }, info) {
        const userId = getUserId(request)
        const userExists = await existsUser(userId)
        if (!userExists) {
            throw errorUserNotFound()
        }
        // console.log(`info: ${JSON.stringify(info, undefined, 2)}`)
    //    return null
       return deleteUser(userId, info)
    },
    async updateUser(parent, args, { request }, info) {
        const userId = getUserId(request)

        if (typeof args.data.password === 'string') {
            args.data.password = await hashPassword(args.data.password)
        }

        return updateUser(userId, args.data)
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