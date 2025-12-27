import express from "express"
import {login, signup, updateUser} from '../controllers/userController.js'
import { authenticate } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login",login);
userRouter.patch("/update",authenticate,updateUser)

export default userRouter;