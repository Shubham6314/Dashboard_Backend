const moongoose = require("mongoose");
const connectDb = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "form",
    };
    await moongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Connected Successfully...");
  } catch (error) {
    console.log("error occured");
  }
};
module.exports = connectDb;
