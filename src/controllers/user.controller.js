import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import pkg from "jsonwebtoken";
const  jwt  = pkg;

// Method to generate access & refresh token for a particular user
const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const access_Token = await user.generateAccessToken()
        const refresh_Token = await user.generateRefreshToken()


        user.refreshToken = refresh_Token  // updating the refreshToken field in the user database
        await user.save({validateBeforeSave: false})  // used to save the above change in the database

        console.log("User updated with new refresh token"); // line 22 update

        return {access_Token, refresh_Token}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

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
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "user with the given username or email already exists")
    }

    // Step 4: check for avatar & cover image.
    // multer gives access to files (in our case: avatar & coverImage file) so, we write req.files
    // avatar[0]?.path gives us the path where multer has stored the avatar file
    const avatarLocalPath = req.files?.avatar[0]?.path 
    //const coverImageLocalPath = req.files?.coverImage[0]?.path   will give error if we don't upload any file for coverImage
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
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
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

const loginUser = asyncHandler( async(req, res) => {
    // Step1: get user details from frontend by doing req.body
    // Step2: validating if user exists or not by checking his username or email in the database
    // Step3: if the user exists then find the user
    // Step4: now, after finding the user check the password entered by the user
    // Step5: if the password entered in correct then generate access token and refresh token
    // Step6: send these tokens as a cookie

    // Step1
    const {username, email, password} = req.body
    // either username or email must be entered by the user or else he will get an error
    if(!(username || email)){
        throw new ApiError(400, "enter either username or email")
    }

    // Step2 & Step3 finding the user if it exists
    const user = await User.findOne({ 
        $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "user with the given username or email doesn't exist")
    }

    // Step4
    // in user.model.js file we made our own methods like isPasswordCorrect, generateAccessToken & generateRefreshToken. These methods can't be accessed from 'User' as these are not mongoDb methods
    // but these methods can be accessed by the 'user' which we had created inside the mongoDb database
    const isPasswordValid = await user.isPasswordCorrect(password)  // 'password' came from req.body in line: 101
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user password")
    }

    // Step5
    const { refresh_Token, access_Token } = await generateAccessAndRefreshToken(user._id)
    // we have used 'user' to call the same 'user' from the database but only without the password & refreshToken field as we don't need password & we already have access to refreshToken of the 'user' in line: 142 and finally rename the updated 'user' as 'loggedInUser' 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Step6
    const options = {    // 'options' help secure the cookie so that the cookie cannot be changed in the frontend but can be changed only on the server side by me
        httpOnly: true,
        secure: true
    }
    // sending the cookies with access & refresh token
    return res.status(200).cookie("accessToken", access_Token, options).cookie("refreshToken", refresh_Token, options).json(
        new ApiResponse(  
            200, // statusCode
            {
                user: loggedInUser, access_Token, refresh_Token  // data
            },
            "User logged In successfully" // message
        )
    )
})

const logoutUser = asyncHandler( async(req, res) => {
    // Step 1: find the user
    const user = await User.findById(req.user._id)

    // Step 2: delete the refresh token from the user
    user.refreshToken = undefined;
    const updatedUser = await user.save({validateBeforeSave: false});
    await User.findById(req.user._id).select("-refreshToken");

    // lines: 168 to 170 is written by me, hitesh sir has used a different code

    // Step 3: clear the cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    console.log("logged out");
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(
        200, {}, "User logged Out"
    ))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200).cookie("accessToken", newAccessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(
            200,
            {accessToken: newAccessToken, refreshToken: newRefreshToken},
            "Access token is refreshed"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}