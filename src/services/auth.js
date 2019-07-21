import _ from 'lodash'
import passport from 'passport'
import FacebookTokenStrategy from 'passport-facebook-token'
import { OAuth2Client } from 'google-auth-library'
import {
    errorTokenIsEmpty, 
    errorUnableToContinueWithGoogle,
    errorUnableToContinueWithFacebook,
    errorFailedToReachFacebook
} from '../utils/errors'

// FACEBOOK STRATEGY
const FacebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
})

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_IOS_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_IOS_APP_SECRET
}, FacebookTokenStrategyCallback))

// authenticate function
const authenticateFacebook = async (accessToken, req, res) => {
    req.body = {
        ...req.body,
        access_token: accessToken,
    }
    try {
        const { data, info } = await authenticateFacebookInternal(req, res)
        if (!_.isEmpty(data)) {
            const { accessToken, profile } = data
            if (_.isEmpty(profile)) throw errorUnableToContinueWithFacebook()
            if (_.isEmpty(profile.name)) throw errorUnableToContinueWithFacebook()
            const userData = {
                accessToken,
                userId: profile.id,
                name: profile.name.givenName,
                lastName: profile.name.familyName
            }
            if (profile.photos !== 0) {
                const [ { value: picture } ] = profile.photos
                if (!_.isEmpty(picture) && _.isString(picture)) {
                    userData.picture = picture
                }
            }
            return userData
        }
        if (!_.isEmpty(info)) {
            switch (info.code) {
                case 'ETIMEDOUT': throw errorFailedToReachFacebook()
                default: throw errorUnableToContinueWithFacebook()
            }
        }
    } catch (error) {
        throw errorUnableToContinueWithFacebook()
    }
}
const authenticateFacebookInternal = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('facebook-token', { session: false }, (err, data, info) => {
        if (err) reject(err)
        resolve({ data, info })
    })(req, res)
})

const authenticateGoogle = async (accessToken) => {
    if (typeof accessToken !== 'string' || 0 === accessToken.length) {
        throw errorTokenIsEmpty() 
    }
    try {
        const client = new OAuth2Client(process.env.GOOGLE_IOS_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken: accessToken,
            audience: process.env.GOOGLE_IOS_CLIENT_ID
        })
        return ticket.getPayload()
    } catch (err) {
        throw errorUnableToContinueWithGoogle()
    }
}

export { authenticateFacebook, authenticateGoogle }