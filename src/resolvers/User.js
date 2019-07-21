import { getUserId } from '../utils/user'

const User = {
    email: {
        fragment: 'fragment userId on User { id }',
        resolve(parent, args, { prisma, request }, info) {
            const userId = getUserId(request, false)
            if (userId && userId == parent.id) {
                return parent.email
            }
            
            return null
        }
    }
}

export { User as default }