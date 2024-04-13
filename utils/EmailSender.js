import nodemailer from "nodemailer";
import "./env.js"

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function ({email, subject, message}) {
  // create reusable transporter object using the default SMTP transport
  try{

    let transporter = nodemailer.createTransport({
      host: process.env.smtp_server,
      port: process.env.smtp_port,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.smtp_username,
        pass: process.env.smtp_password,
      },
    });
  
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.smtp_fromEmail, // sender address
      to: email, // user email
      subject: subject, // Subject line
      html: message, // html body
    });

    return "Email Sent Successfully!";
  }
  catch(e){
    console.log(e.message)
    throw new Error("Some Error Occurred. This means that problem is in our mailing system")
  }

};

export default sendEmail;