import { Router } from "express";
import {loginUser, logoutUser, registerUser, refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
// after adding '/register' in the url (i.e /api/v1/users), a middleware i.e upload is called which accepts avatar image & cover image file and then registerUser method is called
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",  // name of the file will be avatar & for the frontend field should also be named as avatar 
            maxCount: 1 // user can add only 1 file for avatar
        },
        {
            name: "coverImage",
            maxCount: 1 // user can add only 1 file for coverImage
        }
    ]),    
    registerUser
)  

router.route("/login").post(loginUser)

// secured routes - using the auth middleware to check if the user is loggedIn & only if the user is loggedIn then we give the user these routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router