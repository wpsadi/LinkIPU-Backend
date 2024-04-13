import { Router } from "express";
import { checkPassword, createAccount, forgotPassword, loginAccount, logoutAccount, passwordInstructions, resetPassword, resetPasswordPage, verifyEmail } from "../../../controllers/userControllers/userAuthConroller.js";
const userRouter = Router();

// userRouter.
userRouter.post("/create", createAccount);

userRouter.post("/login", loginAccount);

userRouter.get("/verify", verifyEmail);

userRouter.get("/logout", logoutAccount)

userRouter.post("/forgot-password", forgotPassword)

userRouter.route("/reset-password")
    .get(resetPasswordPage)
    .post(resetPassword)

userRouter.get("/password-instructions", passwordInstructions)

userRouter.post("/check-password", checkPassword)
export default userRouter 