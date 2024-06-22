const asyncHandler = (func) => async (req, res, next) => {   // next is a middleware the user browser & our server. next is used to check to check some queries like weather the user is logged in, etc before the server sends a response
    try {
        await func(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            messege: error.messege
        })
    }
}

export {asyncHandler}