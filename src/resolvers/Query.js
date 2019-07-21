import _ from 'lodash'
import moment from 'moment'

import { getUserId } from '../utils/user'
import { errorIncorrectDateProvided } from '../utils/errors'

const Query = {
    me(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        return prisma.query.user({
            where: {
                id: userId
            }
        }, info)
    }
}

export { Query as default }