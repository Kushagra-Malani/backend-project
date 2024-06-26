import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,  // we get a url of the video from a third party service (cloudinary) & the url is stored as a string
            required: true
        },
        thumbnail: {
            type: String,  // we get a url of the image from a third party service (cloudinary) & the url is stored as a string
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: Number,  // cloundinary send the url of the video along with other data like the length of the video, etc 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true  // Automatically manage createdAt and updatedAt fields
    }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema);
