import {connect} from "mongoose"
import "../utils/env.js"

const MongoDB_URI = String(process.env.mongo_uri).concat("linkIPU");

export const dbConnect = async()=>{
    const conn = await connect(MongoDB_URI)
    if (conn){
        console.log(`Connected to a MongoDB Cluster at ${conn.connection.host}`)
    }
    else{
        console.log(`Error in connecting to Mongo Cluster`)
    }
}