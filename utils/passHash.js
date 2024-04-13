import argon2 from 'argon2';
import "./env.js"



export const argonHash =async (password)=>{
    try {
        const salt = Buffer.from(process.env.argon2_salt , 'utf8');

        // Generate the hash with salt
        const hash = await argon2.hash(password, { salt });
        return hash;
    } catch (err) {
        throw new Error(err.message);
        return;
    }
}

export const argonVerify = async (hash, password)=>{
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        throw new Error(err.message);
        return;
    }
}