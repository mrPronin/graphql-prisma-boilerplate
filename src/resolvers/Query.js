import _ from 'lodash'

import {
    getUserId,
    getUserById
} from '../utils/user'

const Query = {
    me(parent, args, { request }, info) {
        const userId = getUserId(request)
        return getUserById(userId)
    },
    loggedInMessage(parent, args, { request }, info) {
        const userId = getUserId(request)
        return 'You are logged in!'
    }
}

export { Query as default }