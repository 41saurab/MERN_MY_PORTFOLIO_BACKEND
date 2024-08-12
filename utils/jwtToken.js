export const sendToken = (user, message, statusCode, res) => {
  const token = user.getJWTToken();
  const options = {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    token,
  });
};
