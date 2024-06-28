import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)  // after adding /register in the url (i.e /api/v1/users), registerUser method is called

export default router