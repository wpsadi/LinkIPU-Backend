import cookieParser from "cookie-parser";
import express from "express"

import cors from "cors";
import morgan from "morgan";
import path from "path"

import { useMiddlewareError } from "./middleware/err.middle.js";
import apiRouter from "./Routes/api/apiRouter.js";


const app = express();

// Default Middleware
app.use(cookieParser())
app.use(cors({origin:"*",credential:false})) ; // Some API endpnt only will have cors not all
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger Middleware
if (process.env.build_environment === "d"){
    app.use(morgan("short"))
}

// Static Files  serving
app.use("/assets",express.static(path.resolve(path.join("public","scriptsStyles"))))

// View Engine
app.set("view engine","ejs")
app.set("views",path.resolve(path.join("public","EJS-pages")))

app.use("/v1",apiRouter)

// Universal Route
app.use("*",(req,res,next)=>{
    res.status(200).render("ErrorPage/err",{title:"Page Not Found",errCode:404,errMessage:"Page not found",errDesc:"It seems that the Page You want to access is not available. Please try again later."})
})




// Error Middleware
app.use(useMiddlewareError)

export default app