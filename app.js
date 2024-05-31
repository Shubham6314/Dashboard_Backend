const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");
const connectDb = require("./config/connectdb.js");
dotenv.config();
const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
app.use(cors());
connectDb(DATABASE_URL);
app.use(express.json());
app.use("/api/user", userRoutes);
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
