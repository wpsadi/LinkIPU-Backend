import emailValidator from "email-validator";

export const emailVal = (email)=>{
    const result = emailValidator.validate(email)
    return result
}