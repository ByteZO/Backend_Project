import { connectDataBase } from "./DataBase/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "../env",
});

connectDataBase()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(` we are listening  on ${process.env.PORT}`);
      app.on("error", (er) => {
        console.log("error while connecting ", er);
      });
    });
  })
  .catch((error) => {
    console.log("this is error ", error);
  });

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
