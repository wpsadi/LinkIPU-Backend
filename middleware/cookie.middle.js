import JWT from "jsonwebtoken"
import "./../utils/env.js"
import AppError from "../utils/errClass.js";

export const RetrieveAdminCookie = async(req,res,next)=>{
    // return next(new AppError("error kya hai",400))
    try{
        const {secureID} = req.cookies || null;
        // console.log(req)
        
        if (!secureID){
            return next(new AppError("Please Login First, thne access this page",401))
        }

        const payload = JWT.verify(secureID,process.env.JWT_SECRET)

        if (!payload){
            return next(new AppError("Invalid Token bogeyman",401))
        }

        req.user = response;
        // CONTENT OF JWT TOKEN
        // {
        //     id: '----------------',
        //     timestamp: '2024-04-02T15:44:04.718Z',
        //     iat: 1712125791,
        //     exp: 1714199391
        //   }

        next();


    }
    catch(e){
        return next(new AppError(e.message,400))
    }
}