class AppError extends Error{
    constructor(message,statusCode,page=false,obj={}){
        super(message);

        this.statusCode = statusCode;
        this.page = page;
        this.obj = obj;
        Error.captureStackTrace(this,this.constructor);
    }
}
export default AppError;