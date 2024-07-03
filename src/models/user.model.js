import mongoose from "mongoose";
import pkg from "jsonwebtoken";
const jwt = pkg;
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,    
            index: true   // index: true helps to optimize searching in the username field
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true    // index: true helps to optimize searching in the fullName field
        },
        avatar: {
            type: String,   // we get a url of the image from a third party service (cloudinary) & the url is stored as a string
            required: true
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']  // if a user doesn't put password he gets this message
        },
        refreshToken: {
            type: String
        }
    }, 
    {
        timestamps: true
    }
);

// Now, when the user enters all the details then before these details gets saved in the database, we want to encrypt the password. We do this by using the pre middleware in Mongoose along with the bcrypt library 
// Pre-save Middleware: The pre middleware for the 'save' operation is defined to encrypt the password before saving the user details.
// As encryption takes time so, we use async
// As this is a middleware, we use next & when the encryption is done we have to call next at the end so that the flag is passed forward
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {  // if password is not updated/modified then no need to encrypt, directly return next() without any encryption
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10)  // this.password selects the password field from userSchema
    next()
})

userSchema.methods.isPasswordCorrect = async function(enteredPassword) {  // adding a method (i.e isPasswordCorrect) to userSchema
    return await bcrypt.compare(enteredPassword, this.password);  // enteredPassword is the password entered by the user which is a string (ex: kush1234) & this.password is the encrypted password which is stored in the database
// bycpt.compare() returns true or false
};

// JWT Token: it is like a key i.e whenever someone sends this token I will send him the data
// Both generateAccessToken & generateRefreshToken are JWT tokens
userSchema.methods.generateAccessToken = function () {  // Method to generate access token
    const payload = {
      _id: this._id,   // _id, email, username, fullName are the key names in payload object while this._id, this.email, this.username, this.fullName are the values coming from the userSchema
      email: this.email, 
      username: this.username,
      fullName: this.fullName
    };
  
    const options = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    };
  
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
    return token;
};

userSchema.methods.generateRefreshToken = function () {  // Method to generate access token
    const payload = {
      _id: this._id,   // generateAccessToken is same as generateRefreshToken, only the payload has less information & the expiry time is high in refresh token

    };
  
    const options = {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    };
  
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
    return token;
};

export const User = mongoose.model('User', userSchema);
