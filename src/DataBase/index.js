import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDataBase = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(" connected successfully... ", connection.connection.host);
  } catch (error) {
    console.log(error ,"ghdar baar ho gai hai ");
    process.exit(1);
  }
};

