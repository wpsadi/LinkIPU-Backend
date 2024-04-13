export const useMiddlewareError = (err,req,res,next)=>{
    // console.log(err)
    err.statusCode = err.statusCode || 400;
    err.message = err.message || "something went wrong"
    try {
        err.message = JSON.parse(err.message);
    }catch(e){
        null
    }
    if (err.page == false){
        res.status(err.statusCode).json({
            success: false,
            response: err.message
        })
    }   
    else{
        const title = err.obj.title || "Error"

        const code = err.statusCode || 400;
        const message = err.message || "Something went wrong"
        // res.send("hi")
        res.status(err.statusCode).render("ErrorPage/err",{...err.obj,title:title,errCode:code,errMessage:message})
    }

}