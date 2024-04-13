import { Schema , model} from "mongoose";
import validator from "validator";

const studentRecordSchema = new Schema({
    name:{
        type:String,
        trim: true,
        required: [true,"Email is required field to allow : create an account"],
        lowercase:true
    },
    email:{
        type: String,
        trim: true,
        unique: [true,"There is email is already reistered in the database"],
        required: [true,"Email is required field to allow : create an account"],
        lowercase:true
    },
    // please keep below thing as numbers only or it will give error, you can add other thing in schema above this but remember to update the pre function length
    rollNo:{
        type:String,
        required: [true,"Specify your Roll No. Use number like [001, 002, ...]"]
    
    },
    enrollment:{
        type:String,
        unique: [true,"Same Enrollment Number Encountered. Plz ensure all numbers are unique"],
        required: [true,"Enrollment Number is required field to allow : create an account"],
    },
    uss_school:{
        type:String,
        required: [true,"Specify the college code. Use codes like [164 for USICT, ...]"]
    },
    startingYear:{
        type:String,
        required: [true,"Specify Year of Admission. Use years like [2023, 2024, ...]"],
    },
    endingYear:{
        type:String,
        required: [true,"Specify Year of Admission. Use years like [2027, 2028, ...]"],
    },
    course:{
        type:String,
        required: [true,"Specify the Code of your Course like [015 for B.Tech(IT), ...]"],
    }
})

studentRecordSchema.pre("save",function(next){
    if(this.startingYear>this.endingYear){
        throw new Error("Starting Year of College should be less than Ending Year of College");
    }
    if (`${this.rollNo}${this.uss_school}${this.course}${this.startingYear-2000}` !== String(this.enrollment)){
        throw new Error("Enrollment Number doesn't match other details. Please ensure that it is correct.")
    }
    const parameters = Object.keys(studentRecordSchema.obj)
    for (let key of [new Set("name","email", ...parameters)].slice(2,parameters.length)){
        if (!validator.isInt(this[key])){
            throw new Error(`Field ${key} is not of Number data type`)
        }
    }

    next();
})

const studentRecordModel = model("student_Record",studentRecordSchema);




export default studentRecordModel;