// cloudinary is used for file upload
// file given by user is first stored in our local server then in cloudinary

// Over here we take the path of the file which is in our local server and put it in cloudinary & after th efile is uploaded in cloudinary, we will unlink (i.e delete) the file from our local storage

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'  // fs is file system which is by default installed with node.js

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }
        else{
            const response = await cloudinary.uploader.upload(localFilePath, { 
                resource_type: 'auto'
            })
            console.log("Your file has been uploaded on cloudinary", response.url);
            fs.unlinkSync(localFilePath)
            return response
        }
    } catch (error) {
        fs.unlinkSync(localFilePath) // removing the locally saved file as the upload to cloudinary failed so, there is no need of keeping it in our local storage as it may contain virus
        return null
    }
}

export {uploadOnCloudinary}