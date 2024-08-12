import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full Name Is Required!"],
  },
  email: {
    type: String,
    required: [true, "Email Is Required"],
  },
  phone: {
    type: String,
    required: [true, "Phone Number Is Required"],
  },
  aboutMe: {
    type: String,
    required: [true, "About Me Is Required"],
  },
  password: {
    type: String,
    required: [true, "Password Is Required"],
    minLength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  portfolioURL: {
    type: String,
    required: [true, "Portfolio URL Required!"],
  },
  githubURL: {
    type: String,
  },
  instagramURL: {
    type: String,
  },
  twitterURL: {
    type: String,
  },
  linkedInURL: {
    type: String,
  },
  facebookURL: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex"); // WILL GENERATE TOKEN 

  // HASHING AND ADDING RESET PASSWORD TOKEN TO userSchema 
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // SETTING RESET PASSWORD TOKEN EXPIRY TIME 
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
