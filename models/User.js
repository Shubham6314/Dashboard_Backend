const moongoose = require("mongoose");
const userSchema = new moongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true, trim: true },
  img: { type: String },
});

const UserModel = moongoose.model("user", userSchema);
module.exports = UserModel;
