import { Router } from "express";
import userRouter from "./userRoutes/userRoutes.js";

const apiRouter = Router();

// Just a Simple Health Check Path
apiRouter.use("/health",(req,res)=>res.status(200).json({success:true,response:"Server is running"}))


//user Router
apiRouter.use("/user",userRouter);



// Universal Route For API Endpoints
apiRouter.use("*",(req,res)=>res.status(404).json({success:false,response:"API Endpoint Accessible. Path is not Valid"}))

export default apiRouter;