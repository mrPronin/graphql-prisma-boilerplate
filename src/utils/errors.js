const errorUserIdIsEmpty = () => {
    let error = new Error('User id is empty.')
    error.status = 400
    return error
}

const errorTokenIsEmpty = () => {
    let error = new Error('Token is empty.')
    error.status = 400
    return error
}

const errorAuthProviderTypeIsEmpty = () => {
    let error = new Error('Auth provider type is empty.')
    error.status = 400
    return error
}

const errorUserDataIsEmpty = () => {
    let error = new Error('User data is empty.')
    error.status = 400
    return error
}

const errorEmailTaken = () => {
    let error = new Error('Email taken.')
    error.status = 400
    return error
}

const errorUnableToLogin = () => {
    let error = new Error('Unable to login.')
    error.status = 400
    return error
}

const errorUserNotFound = () => {
    let error = new Error('User not found.')
    error.status = 400
    return error
}

const errorAuthenticationRequired = () => {
    let error = new Error('Authentication required.')
    error.status = 400
    return error
}

const errorIncorrectPasswordLength = () => {
    let error = new Error('Incorrect password length.')
    error.status = 400
    return error
}

const errorUnableToContinueWithGoogle = () => {
    let error = new Error('Unable to continue with Google.')
    error.status = 400
    return error
}

const errorUnableToContinueWithFacebook = () => {
    let error = new Error('Unable to continue with Facebook.')
    error.status = 400
    return error
}

const errorFailedToReachFacebook = () => {
    let error = new Error('Failed to reach Facebook. Try again later.')
    error.status = 400
    return error
}

const errorUnableToDeleteUser = () => {
    let error = new Error('Unable to delete user.')
    error.status = 400
    return error
}

const errorIncorrectDateProvided = () => {
    let error = new Error('Incorrect date provided.')
    error.status = 400
    return error
}

export {
    errorTokenIsEmpty,
    errorEmailTaken,
    errorUnableToLogin,
    errorUserNotFound,
    errorAuthenticationRequired,
    errorIncorrectPasswordLength,
    errorUnableToContinueWithGoogle,
    errorUnableToContinueWithFacebook,
    errorFailedToReachFacebook,
    errorAuthProviderTypeIsEmpty,
    errorUserDataIsEmpty,
    errorUserIdIsEmpty,
    errorUnableToDeleteUser,
    errorIncorrectDateProvided
}