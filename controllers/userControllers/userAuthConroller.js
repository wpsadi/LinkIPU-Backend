import studentRecordModel from "../../models/studentRecordModel.js";
import { userModel } from "../../models/userModel.js";
import { decrypt } from "../../utils/cryptoCipher.js";
import sendEmail from "../../utils/EmailSender.js";
import { emailVal } from "../../utils/emailVal.js";
import AppError from "../../utils/errClass.js";
import { argonHash } from "../../utils/passHash.js";
import passVal from "../../utils/passVal.js";

// cookieName is secureID
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)
}

export const createAccount = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            throw new Error("Email & password are required")
        }

        email = (email.trim()).toLowerCase();

        if (!emailVal(email)) {
            throw new Error("Invalid email");
        }

        let checkEligibility = await studentRecordModel.findOne({ email: email });
        if (!checkEligibility) {
            throw new Error(`Your Email: ~${email}~ is unauthorized to create an account. Please contact support.`)
        }

        let checkPass = new passVal(password);
        if (!checkPass.validate()) {
            throw new Error(JSON.stringify(checkPass.validateError()));
        }
        // ******** This Code used to check password breach in online databases ************
        // if ((await checkPass.isBreached()).leaked) {
        //     throw new Error(`Password is breached. Found ${(await checkPass.isBreached()).instances} times. Please use a different password. If you continue to experience issues please contact support.`);
        //     return;
        // }



        let existingUser = await userModel.findOne({ email: email });
        // console.log(existingUser === null)   
        if (existingUser !== null) {

            if (existingUser.emailVerified === false) {
                const userID = await userModel.findOneAndDelete({ email: email, emailVerified: false });
            }
            else {
                throw new Error("User already exists")
            }

        }


        const user = await userModel.create({ email: email, password });

        const verifyToken = user.verificationLinkToken

        const emailStruct = {
            email:email,
            subject: "Account SignUP Verification",
            message:`Hi ${checkEligibility.name},<br>Click <a href="${process.env.BaseURL}v1/user/verify?signature=${verifyToken}">here</a> to verify your account`
        }
        await sendEmail(emailStruct)

        // const copyUser = new Object(user)
        // delete copyUser["password"]

        // const timestamp = copyUser;
        // console.log(copyUser)
        res.status(201).json({
            success: true,
            response: "Email is sent for Validating your account"
        })
    } catch (error) {
        next(new AppError(error.message))
    }
}


export const loginAccount = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            throw new Error("User & password are required")
        }

        email = (email.trim()).toLowerCase();

        if (!emailVal(email)) {
            throw new Error("Invalid email");
        }


        let existingUser = await userModel.findOne({ email: email }).select("+password");



        if (!existingUser) {
            throw new Error("User not found");
        }

        if (!(await existingUser.verifyPassword(password))) {
            throw new Error("Invalid password");

        }


        const token = existingUser.genJWT();

        res.cookie("secureID", token, cookieOptions)



        res.status(200).json({
            success: true,
            response: "logged in"
        })

    } catch (error) {
        next(new AppError(error.message))
    }
}

export const verifyEmail = async (req, res, next) => {
    try {
        const { signature } = req.query;
        if (!signature) {
            throw new Error("Please Provide signature to verify your Email")
        }
        let decryptSignature
        try {
            decryptSignature = String(decrypt(signature));
        } catch (e) {
            throw new Error("Invalid Signature")
        }
        const jsonData = JSON.parse(decryptSignature);
        const { id, createdTime } = jsonData;

        let user = await userModel.findById(id).select("+verificationLinkTime +verificationLinkToken");

        if (!user) {
            throw new Error("User Account might have been deleted")
        }


        if (user.emailVerified) {
            throw new Error("Email is already verified")
        }

        // Checking the time of verification
        if (Date.now() - new Date(createdTime).getTime() > 1560 * 1000) {
            throw new Error("Signature Expired")
        }




        if (new Date(createdTime).getTime() !== new Date(user.verificationLinkTime).getTime()) {
            throw new Error("Unauthorised Signature")
        }


        await userModel.findByIdAndUpdate(id, { emailVerified: true, verificationLinkToken: null, verificationLinkTime: null })
        //Update the User's verification token and time to null

        // res.send("hir")
        res.status(201).render("universalPage/universal",{title:"Email Verified",desc:"We have Successfully marked your Email as Verified",Message:"Email Verification Successfull"})

    }
    catch (error) {
        // next(new AppError(error.message))
        next(new AppError(error.message,400,true,{title:"Email Verification Error",errCode:401,errMessage:error.message,errDesc:"Please try again !"}))
    }
}

export const logoutAccount = async (req, res, next) => {
    try {
        res.clearCookie("secureID", {...cookieOptions,expires:new Date(Date.now()-1000)})
        res.status(200).json({
            success: true,
            response: "Logged Out"
        })
    }
    catch (error) {
        next(new AppError(error.message))
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;
        if (!email) {
            throw new Error("Please provide email")
        }

        email = (email.trim()).toLowerCase();

        
        if (!emailVal(email)) {
            throw new Error('Invalid Email')
        }
        
        const userDetails = await studentRecordModel.findOne({ email: email });
        if (!userDetails) {
            throw new Error("User not found")
        }

        const user =  await userModel.findOne({ email: email });
        const resetToken = user.getResetPasswordToken();



        const url = `${process.env.BaseURL}v1/user/reset-password?requestID=${resetToken}`;
        // console.log(`${url}&expireTime=${expireTime}`)
        const message = `HI ${userDetails.name},<br>Forgot your password? Submit a request with your new password and passwordConfirm to: ${url}.\nIf you didn't forget your password, please ignore this email!`

        try {
            // console.log(userDetails.email,message)
            await sendEmail({
                email: userDetails.email,
                subject: "Password Reset Token",
                message:message
            })
            res.status(200).json({
                success: true,
                response: "Check Your Mail for further Instruction"
            })
        } catch (err) {
            console.log(err.message)
            throw new Error("Email could not be sent")
        }
    } catch (error) {
        next(new AppError(error.message))
    }
}

// Change the time Password Token Expiry here...
export const resetPasswordPage = async(req,res,next)=>{
    try{
        const {requestID} = req.query; // Rememmber the calling of requestID

        if (!requestID){
            throw new Error("Please Provide RequestID to proceed")
        }   

        let strJSON;
        let dataJSON;
        try{
           strJSON = decrypt(requestID);
           dataJSON = JSON.parse(strJSON);
        }catch(e){
          throw new Error("Invalid RequestID")
        
        }
        const {id,createdTime,updatedAt,createdAt} = dataJSON;

        
        
        const user = await userModel.findById(id).select("+updatedAt +createdAt");
        if (!user){
            throw new Error("User not found")
        }
        // console.log(new Date(createdAt).getTime() ===new Date(user.createdAt).toString())
        if (new Date(createdAt).getTime() !== new Date(user.createdAt).getTime()){
            throw new Error("Unauthorised RequestID")
        }

        if (new Date(updatedAt).getTime() !== new Date(user.updatedAt).getTime()){
            throw new Error("Request ID Expired - Some Change has been made in User's profile")
        }

        // Change the time Password Token Expiry
        if (Date.now() - new Date(createdTime).getTime() > 565656 *60 * 1000){
            throw new Error("RequestID Expired")
        }
        const {email,name,rollNo,enrollment,uss_school,startingYear,endingYear,course} = await studentRecordModel.findOne({email:user.email})
        const userDet = new Object({email,name,rollNo,enrollment,uss_school,startingYear,endingYear,course})
        // res.status(200).render("resetPasssword/resetPassword")
        res.status(200).render("resetPassword/resetPassword",{...userDet,role:user.role})


  
        

        
    }catch(error){
       next(new AppError(error.message,400,true,{title:"Request Verification Error",errCode:401,errMessage:error.message,errDesc:"Please try again !"}))
   
    }
}

export const resetPassword = async(req,res,next)=>{
    try{
        const {requestID,password} = req.body; // Rememmber the calling of requestID

        if (!requestID || !password){
            throw new Error("Please Provide RequestID, new Password to proceed")
        }   

        let strJSON;
        let dataJSON;
        try{
           strJSON = decrypt(requestID);
           dataJSON = JSON.parse(strJSON);
        }catch(e){
          throw new Error("Invalid RequestID")
        
        }
        const {id,createdTime,updatedAt,createdAt} = dataJSON;

        
        
        const user = await userModel.findById(id).select("+updatedAt +createdAt +password");
        if (!user){
            throw new Error("User not found")
        }
        // console.log(new Date(createdAt).getTime() ===new Date(user.createdAt).toString())
        if (new Date(createdAt).getTime() !== new Date(user.createdAt).getTime()){
            throw new Error("Unauthorised RequestID")
        }

        if (new Date(updatedAt).getTime() !== new Date(user.updatedAt).getTime()){
            throw new Error("Request ID Expired - Some Change has been made in User's profile")
        }

        // Change the time Password Token Expiry
        if (Date.now() - new Date(createdTime).getTime() > 565656 *60 * 1000){
            throw new Error("RequestID Expired")
        }

        console.log(req.body)
        if (!new passVal(password).validate()){
            throw new Error("Password doesn't meet the requirements")
        }

        await userModel.findByIdAndUpdate(id, { password:await argonHash(password) }).select("+password");
        
        // res.status(200).render("resetPasssword/resetPassword")
        res.status(201).json({
            success:true,
            response:"Password Updated"
        
        })


  
        

        
    }catch(error){
       next(new AppError(error.message))
   
    }
}


export const passwordInstructions = async(req,res,next)=>{
    try{
        const pw = new passVal().instructions();
        res.status(200).json({
            success:true,
            response:pw
        })
    }catch(e){
        next(new AppError(e.message))
    }
}

export const checkPassword = async(req,res,next)=>{
    try{
        let {password} = req.body;
        if (!password){
            throw new Error("Please provide password")
        }
        const checkPass = new passVal(password);
        const result = checkPass.validate();
        res.status(200).json({
            success:true,
            response:result
        })
    }
    catch(e){
        next(new AppError(e.message))
    }
}