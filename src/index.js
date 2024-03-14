import { connectDataBase } from "./DataBase/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "../env",
});

connectDataBase();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log(error);
//     });
//     app.listen(process.env.PORT, () => {
//       console.log("connected..."`${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// })();
