import app from "./app.js";
import { dbConnect } from "./dbConfig/dbConfig.js";
import "./utils/env.js";



const PORT = process.env.PORT || 5000;  // Port number

app.listen(PORT, async () => {
    // Initialising Database
    await dbConnect()
    console.log(`Server is running on port ${PORT} at ${new Date(Date.now()).toUTCString()}`);
});

