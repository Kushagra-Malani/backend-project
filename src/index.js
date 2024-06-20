//require('dotenv').config({path: './env'})
import 'dotenv/config';
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

connectDB()  // database executed


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