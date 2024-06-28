import { asyncHandler } from "../utils/asyncHandler.js";

// Method to register a user
const registerUser = asyncHandler( async(req, res) => {
    res.status(500).json({
        message: "chai"
    })
})

export {registerUser}