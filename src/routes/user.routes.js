import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/ApiError.js";

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

export default router