const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");
const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
// const sendEmail = require("../utils/email");
const Email = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // const cookieOptions = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  //   // sameSite: "None",
  //   httpOnly: true,
  // };

  // Set 'secure' only in production (so it works on localhost)
  // if (process.env.NODE_ENV === "production") {
  //   cookieOptions.secure = true; // Cookies work only over HTTPS
  //   cookieOptions.sameSite = "None";
  //   console.log("secure set to true");
  // } else {
  //   cookieOptions.secure = false; // Allow HTTP for localhost development
  // }
  // res.cookie("jwt", token, cookieOptions);

  // ✅ Debugging: Check if the cookie is being set

  const serialized = serialize("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRES_IN,
    path: "/",
  });
  res.setHeader("Set-Cookie", serialized);
  // console.log("Set-Cookie header:", res.getHeaders()["set-cookie"]);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsyncError(async (req, res, next) => {
  //we cant use the following line of code to create a new user because anyone an define their role as admin while defining the req.body
  // const newUser = await User.create(req.body);
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new AppError("Email already in use", 400));
  }

  //here the user can only define the name, email, password
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phoneNumber: `+91${req.body.phoneNumber}`,
    isVerified: true,
    // passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role,
  });

  // const url = `${process.env.FRONTEND_URL_DEV}/`;
  // console.log(url);

  // await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, res);
});

// exports.signup = catchAsyncError(async (req, res, next) => {
//   const existingUser = await User.findOne({ email: req.body.email });
//   if (existingUser) {
//     return next(new AppError("Email already in use", 400));
//   }

//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//     phoneNumber: `+91${req.body.phoneNumber}`,
//     isVerified: false, // New users are unverified
//   });

//   // Generate a verification token
//   // const verificationToken = crypto.randomBytes(32).toString("hex");
//   const verificationToken = newUser.createEmailVerificationToken();
//   // newUser.emailVerificationToken = crypto
//   //   .createHash("sha256")
//   //   .update(verificationToken)
//   //   .digest("hex");
//   // newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Expires in 24 hours
//   await newUser.save({ validateBeforeSave: false });

//   try {
//     // Verification URL
//     let verificationURL = "";
//     if (process.env.NODE_ENV === "development") {
//       verificationURL = `${process.env.FRONTEND_URL_DEV}/verify-email/${verificationToken}`;
//     } else {
//       verificationURL = `${process.env.FRONTEND_URL_PROD}/verify-email/${verificationToken}`;
//     }

//     // Send verification email
//     await new Email(newUser, verificationURL).sendVerificationEmail();
//   } catch (err) {
//     newUser.emailVerificationToken = undefined;
//     newUser.emailVerificationToken = undefined;
//     await newUser.save({ validateBeforeSave: false });

//     return next(new AppError("Error sending email. Please try again", 500));
//   }

//   res.status(201).json({
//     status: "success",
//     message:
//       "Verification email sent. Please verify your email before logging in.",
//   });
// });

exports.verifyEmail = catchAsyncError(async (req, res, next) => {
  // Hash token to match stored hash
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // console.log(hashedToken);
  // console.log(req.params.token);

  // Find user with matching token and check if it’s still valid
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired verification token", 400));
  }

  // Mark user as verified
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createAndSendToken(user, 200, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  //check if the email and password exist
  if (!email || !password)
    return next(new AppError("Please enter email and paswword", 404));

  //check if the user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or pasword", 401));
  }

  if (user.isVerified === false) {
    return next(new AppError("Please verify your email to log in", 401));
  }

  //if everything is okay, create token and send response
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res, next) => {
  // res.cookie("jwt", "dummytext", {
  //   expires: new Date(Date.now() + 1000),
  //   httpOnly: true,
  // });

  const serialized = serialize("jwt", null, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: -1,
    path: "/",
  });
  res.setHeader("Set-Cookie", serialized);

  // res.clearCookie("jwt");
  // console.log("cookie cleared");

  res.status(200).json({ status: "success" });
};

exports.protect = catchAsyncError(async (req, res, next) => {
  // console.log("protecting for", req.originalUrl);
  //Get token and check if it exits:
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  //verification of token:
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user of the token still exists:
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user of this token no longer exists.", 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User has recently changed password", 401));
  }

  //Grant access to the protected route
  req.user = currentUser;

  next();
});

exports.checkIsLoggedIn = catchAsyncError(async (req, res, next) => {
  // console.log("protecting for", req.originalUrl);
  //Get token and check if it exits:
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next();
  }

  //verification of token:
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user of the token still exists:
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next();
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next();
  }

  //Grant access to the protected route
  req.user = currentUser;

  next();
});

exports.isLoggedIn = catchAsyncError(async (req, res, next) => {
  if (!req.user) {
    // return next(new AppError("Not Logged In", 401));
    return res.status(200).json({
      status: "success",
      user: null, // Instead of an error, return null
    });
  }
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

// exports.restrictToAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return next(
//       new AppError("You do not have permission to perform this action", 403)
//     );
//   }
//   next();
// };

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles = ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  //get the uer based on req.email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }

  if (!user.isVerified) {
    return next(
      new AppError(
        "Email not verified. Please verify your email before resetting the password.",
        403
      )
    );
  }

  //Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // // send it to user's email
  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    //ui URL:
    let resetURL = "";
    if (process.env.NODE_ENV === "development") {
      resetURL = `${process.env.FRONTEND_URL_DEV}/reset-password/${resetToken}`;
    } else {
      resetURL = `${process.env.FRONTEND_URL_PROD}/reset-password/${resetToken}`;
    }

    // await sendEmail({
    //   email: req.body.email,
    //   //or user.email
    //   subject: "Your password reset token (valid for 10 minutes)",
    //   message,
    // });

    await new Email(user, resetURL).sendPasswordReset();
    // console.log("HOIIOio");

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Please try again later",
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on password reset token
  const encryptedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    //check if expiration time is in the future:
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If the user exists and the token has not yet expired, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) Change the passwordChangedAt property
  await user.save();

  // // 4) Log the uset in(send JWT)
  // createAndSendToken(user, 200, res);

  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully.",
  });
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if the POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError("Current password that you entered is wrong", 401)
    );
  }

  // 3) Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log the user in(send jwt)
  createAndSendToken(user, 200, res);
});
