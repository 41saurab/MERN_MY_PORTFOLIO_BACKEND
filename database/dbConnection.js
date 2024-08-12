import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_MY_PORTFOLIO",
    })
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      console.error("Error connecting to database", error);
    });
};
