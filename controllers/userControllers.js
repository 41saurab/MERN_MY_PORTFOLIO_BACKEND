import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import cloudinary from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/nodeMailerSendEmail.js";
import crypto from "crypto";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar Is Required", 400));
  }

  const { avatar, resume } = req.files;

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(avatar.tempFilePath, { folder: "PORTFOLIO_AVATAR" });

  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    return next(new ErrorHandler("Cloudinary Error: " + (cloudinaryResponseForAvatar.error || "Unknown Cloudinary Error"), 500));
  }

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(resume.tempFilePath, { folder: "PORTFOLIO_RESUME" });

  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    return next(new ErrorHandler("Cloudinary Error: " + (cloudinaryResponseForResume.error || "Unknown Cloudinary Error"), 500));
  }

  const { fullName, email, phone, aboutMe, password, portfolioURL, githubURL, instagramURL, twitterURL, facebookURL, linkedInURL } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedInURL,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });
  sendToken(user, "User Registered Successfully", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Provide All Details!!"));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password!!", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email or Password!!", 401));
  }

  sendToken(user, "User Logged In Successfully", 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expiresIn: new Date(Date.now()),
      sameSite: "None",
      secure: true,
    })
    .json({
      success: true,
      message: "User Logged Out Successfully",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    password: req.body.password,
    portfolioURL: req.body.portfolioURL,
    githubURL: req.body.githubURL,
    instagramURL: req.body.instagramURL,
    twitterURL: req.body.twitterURL,
    facebookURL: req.body.facebookURL,
    linkedInURL: req.body.linkedInURL,
  };
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);
    const profileImageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(profileImageId);
    const newProfileImage = await cloudinary.uploader.upload(avatar.tempFilePath, { folder: "PORTFOLIO_AVATAR" });

    newUserData.avatar = {
      public_id: newProfileImage.public_id,
      url: newProfileImage.secure_url,
    };
  }

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeFileId = user.resume.public_id;
    if (resumeFileId) {
      await cloudinary.uploader.destroy(resumeFileId);
    }
    const newResume = await cloudinary.uploader.upload(resume.tempFilePath, { folder: "PORTFOLIO_RESUME" });

    newUserData.resume = {
      public_id: newResume.public_id,
      url: newResume.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, { new: true, runValidators: true });

  res.status(200).json({
    success: true,
    message: "Profile Updated!",
    user,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please Fill All Fields.", 400));
  }
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Current Password!"));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler("New Password And Confirm New Password Do Not Match!"));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Updated!",
  });
});

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "6698964ad25834266757058e";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:\n\n${resetPasswordUrl}\n\nIf you did not request this email, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Personal Portfolio Dashboard Password Recovery",
      message,
    });
    res.status(201).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

  if (!user) {
    return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password And Confirm Password Not Matched.", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, "Password Changed Successfully", 200, res);
});
