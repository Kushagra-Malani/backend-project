// const asyncHandler = (func) => async (req, res, next) => {   // next is a middleware between the user browser & our server. next is used to check some queries like weather the user is logged in, etc before the server sends a response
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             messege: error.messege
//         })
//     }
// }

const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}