import mongoose from "mongoose";
import { MONGODB_CONFIG } from "../../config/db.js";






export const ConnectionMongoDB =  async()=>{
    try {
       const connectionInstance  = await mongoose.connect(MONGODB_CONFIG.uri);
           console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
            process.exit(1);
    }
}





