import { model, Schema } from "mongoose";
import { argonHash, argonVerify } from "../utils/passHash.js";
import JWT from "jsonwebtoken";
import "./../utils/env.js"
import { decrypt, encrypt } from "../utils/cryptoCipher.js";

let userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: [true,"Account already exists with this email. Kindly login or use another email"],
    required: [true,"Email is required field to create an account"],
    lowercase:true
  },
  password: {
    type: String,
    trim: true,
    required: [true,"Password is required field to create an account"],
    select:false
  },
  role:{
    type:String,
    enum:["student"],
    default:"student"
  },
  emailVerified:{
    type: Boolean,
    enum : [true,false],
    default:false
  },
  verificationLinkTime:{
    type:Date,
    select: false,
  },
  verificationLinkToken:{
    type:String,
    select:false,
    unique:true,
    trim:true
  }
},{
    timestamps:true,
    autoIndex:true
});


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await argonHash(this.password);
  }
  if (this.isModified("email"
    )){
      const requestedTime = new Date(Date.now())
      const jsonStr = JSON.stringify({id:this._id,createdTime:requestedTime})
      const encryptedStr = encrypt(jsonStr)

      this.verificationLinkTime = requestedTime
      this.verificationLinkToken = encryptedStr
    }
  next();
});

userSchema.methods={
    async verifyPassword(password){
        return await argonVerify(this.password, password)
    },
    genJWT(){
        return JWT.sign({id:this._id,timestamp:this.updatedAt},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRES
        })
    },
    RequestverificationToken(){
      const requestedTime = new Date(Date.now())
      const jsonStr = JSON.stringify({id:this._id,createdTime:requestedTime})
      const encryptedStr = encrypt(jsonStr)

      this.verificationLinkTime = requestedTime
      this.verificationLinkToken = encryptedStr
      this.save();

      return encryptedStr
    },
    getResetPasswordToken(){
      const requestedTime = new Date(Date.now())
      const jsonStr = JSON.stringify({id:this._id,createdTime:requestedTime,updatedAt:this.updatedAt,createdAt:this.createdAt})
      const encryptedStr = encrypt(jsonStr)
      return encryptedStr;
    },
    verifyResetPasswordToken(requestID){

      
        
    }

    
}

export const userModel = model("user", userSchema);