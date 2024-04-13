import passwordValidator from 'password-validator';
// @ts-nocheck
import leakCheck from "@syntaxiscs/password-leak-check";

// Create a schema
var schema= new passwordValidator();

// Add properties to it
// Please remember that UserModel will check for the length and other thing, so make sure if you alter this, you also alter the UserModel
schema
.is().min(8)                                    // Minimum length 8
.is().max(100,"Maximum permissible length of Password is 100 characters")                                  // Maximum length 100
.has().uppercase(1,"Password should contain at least 1 UPPERCASE character")                              // Must have at least 1 uppercase letters
.has().lowercase(1,"Password should contain at least 1 LOWERCASE character")                              // Must have at least 1 lowercase letters
.has().digits(2,"Password should contain at least 2 digits")                              // Must have at least 2 digits
// .has().symbols(1,"Password should contain at least 1 special character {!@#%_-+=/?}").oneOf(["!@#%_-+=/?".split("")])                              // Must have at least 1 special character
.has().not().spaces(0,"Password can't contain spaces")                           // Should not have spaces


// Please make sure you type similar instrction that are to be send when creating account
class passVal{
    constructor(password=""){
        this.password = password
    }
    validate(){
        if (this.password === ""){
            throw new Error("Password is undefined")
            return
        }
        const result = schema.validate(this.password)
        return result
    }
    validateError(){
        if (this.password === ""){
            throw new Error("Password is undefined")
            return
        }
        const result = schema.validate(this.password, { details: true })
        return result
    }
    async isBreached(){
        if (this.password === ""){
            throw new Error("Password is undefined")
            return
        }
        const result = await leakCheck.checkPassword(this.password)
        return result
    }
    instructions(){
        return [
            "Password should contain at least 8 characters",
            "Password should contain at most 100 characters",
            "Password should contain at least 1 UPPERCASE character",
            "Password should contain at least 1 LOWERCASE character",
            "Password should contain at least 2 digits",
            "Password should contain at least 1 special character {!@#%_-+=/?}",
            "Password can't contain spaces"
        ]
    }

}



export default passVal;