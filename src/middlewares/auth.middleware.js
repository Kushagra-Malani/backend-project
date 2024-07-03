import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import pkg from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
const  jwt  = pkg;

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        if(token){
            console.log("logout token generated");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;  // adding a new object by the name 'user'(left side) in request(req). The object added in req is 'user'(right side)
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})