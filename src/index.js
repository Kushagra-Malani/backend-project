//require('dotenv').config({path: './env'})
import 'dotenv/config';
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import {app} from './app.js'
import connectDB from "./db/index.js";

const port = process.env.PORT || 8000
connectDB()  // database executed
.then(() => {   // as the function-connectDb has async in it so, it gives promises also i.e when the function is called, we get .then() & .catch()
    app.on("error", (error) => {
        console.log("Server connection failed: ", error);
    })
    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    })
})       
.catch((err) => {
    console.log("MongoDb connection failed!!! : Error: ", err);
})

/*
Immediately Invoked Function Expressions (IIFE) are JavaScript functions 
that are executed immediately after they are defined. 

Syntax:
(function (){ 
  Function Logic Here. 
})();
*/

/*
import express from "express";
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERR: ", error);
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on post ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR: ", error);
        throw err
    }
})()
*/