import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDb connection error ", error);
        process.exit(1) // nodejs gives access to process & our application is also running in some process & .exit(1) is used to exit our application 
    }
}

export default connectDB