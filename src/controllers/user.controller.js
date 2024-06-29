import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Method to register a user
const registerUser = asyncHandler( async(req, res) => {
    // step1: get user details from frontend
    // step2: validation/checking all the details i.e they are entered in correct format or no field is empty
    // step3: check if user already exists, we can do this by checking username or email as both the fields are unique in our user model
    // step4: check for avatar & cover image. Note that avatar is a required field  (first multer uploads the images in our local server)
    // step5: upload the images on cloudinary (then we have to get the url in response after uploading in cloudinary)
    // step6: create user object (as data sent to mongoDb must be an object) -> create entery in database
    // step7: remove password and refresh token field from response
    // step8: check the response (i.e it is not null) to see if user had been created or not
    // step9: then send the response to frontend 

    // Step 1: Get user details from frontend
    const { username, email, fullName, password } = req.body  // data coming from a form or json can be accessed by req.body but files like images can't be accessed
    console.log("email: ", email);
     
    // Step 2: Validate user details
    if(fullName === ""){
        throw new ApiError(400, "fullName is required")
    }
    else if(email === ""){
        throw new ApiError(400, "email is required")
    }
    else if(username === ""){
        throw new ApiError(400, "username is required")
    }
    else if(password === ""){
        throw new ApiError(400, "password is required")
    }

    // Step 3: Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
    if (existingUser) {
        throw new ApiError(409, "user with the given username or email already exists")
    }

    // Step 4: check for avatar & cover image.
    // multer gives access to files (in our case: avatar & coverImage file) so, we write req.files
    // avatar[0]?.path gives us the path where multer has stored the avatar file
    const avatarLocalPath = req.files?.avatar[0]?.path 
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){   // we only check for avatar as it is a required field in user model
        throw new ApiError(400, "Avatar image is required")
    }

    // Step 5: upload the images to cloudinary
    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath)
    const coverImageCloudinary = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatarCloudinary){
        throw new ApiError(500, "Re-upload avatar image")
    }

    // Step 6: Create user object and saving it in database
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatarCloudinary.url,
        coverImage: coverImageCloudinary?.url || "",  // if coverImageCloudinary is present then take out its url else give "" (empty string)
        password
    });

    // Step 7: Remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Step 8: checking if the user is created or not
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // Step 9: return the response to frontend
    return res.status(201).json(
        ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

export {registerUser}