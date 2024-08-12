import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message, email } = req.body;

  if (!senderName || !subject || !message || !email) {
    return next(new ErrorHandler("Please Provide All Details", 400));
  }
  const data = await Message.create({ senderName, subject, message, email });
  res.status(200).json({
    success: true,
    message: "Message Sent Successfully",
    data,
  });
});

export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  if (!message) {
    return next(new ErrorHandler("Message Not Found", 404));
  }
  await message.deleteOne();
  res.status(200).json({
    success: true,
    message: "Message Deleted Successfully",
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();
  res.status(200).json({
    success: true,
    messages,
  });
});
