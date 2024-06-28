import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,  // this is the only origin i.e(CORS_ORIGIN) we are allowing to interact with our backend
    credentials: true
}))

// as data is coming from various places in our backend like: data from url, someone will send data in json, someone will send data in body, someone will send form
// Hence, we are preparing for that only
app.use(express.json({limit: "16kb"})) // our backend can accept a maximum of 16kb json data from a form
app.use(express.urlencoded({limit: "16kb"})) // the data which comes from the URL has some special characters like %20, etc so, we use urlencoded so that there is a standard for these special characters & no error comes when we take data from a url
app.use(express.static("public"))  // static is used to store images, pdf, files, etc in our server in a public folder called "public"
app.use(cookieParser()) // to access or set cookies from the user's browser from my server in a secure way

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter)  // after coming to this url (http://localhost:8000/api/v1/users) userRouter takes control and re-directs the user to http://localhost:8000/api/v1/users/register where the registerUser method is called and the user is registered

export { app }