import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.models.js";

// Register Users
const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all required credentials.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      message: "Registration successful.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
};

// Login Users
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User not found! Please register first",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, checkUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        username: checkUser.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const isProduction = process.env.NODE_ENV === "production";
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id,
          username: checkUser.username,
        },
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// Logout users
const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  return res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Logged out successfully!",
    });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide an email address.",
    });
  }

  try {
    const user = await User.findOne({ email });

    // Prevent account enumeration by returning a generic success message
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been processed.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_BASE_URL || "http://localhost:5173"}/auth/reset-password/${resetToken}`;

    const responsePayload = {
      success: true,
      message:
        "If an account exists with this email, a reset link has been processed.",
    };

    // Only expose resetUrl in development for testing without SMTP configured
    if (process.env.NODE_ENV !== "production") {
      responsePayload.resetUrl = resetUrl;
      responsePayload.devNote =
        "Visible in development only. Configure an email provider for production.";
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to create password reset link.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Please provide a new password.",
    });
  }

  try {
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};

// Auth-Middleware: checks Cookie first, falls back to Authorization Bearer header
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const headerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const token = req.cookies?.token || headerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! Token not provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! Invalid or expired token.",
    });
  }
};

// Admin role verification middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access forbidden. Admin role required.",
    });
  }
  next();
};

export {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  adminMiddleware,
  forgotPassword,
  resetPassword,
};
