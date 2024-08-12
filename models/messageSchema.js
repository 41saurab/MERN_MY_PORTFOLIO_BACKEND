import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    minLength: [2, "Name Must Contain At Least 2 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Email Is Required"],
    validate: [validator.isEmail, "Please Enter A Valid Email."],
  },
  subject: {
    type: String,
    minLength: [2, "Subject Must Contain At Least 2 Characters!"],
  },
  message: {
    type: String,
    minLength: [2, "Message Must Contain At Least 2 Characters!"],
  },
  ceratedAt: {
    type: Date,
    default: Date.now(),
  },
});
export const Message = mongoose.model("Message", messageSchema);
