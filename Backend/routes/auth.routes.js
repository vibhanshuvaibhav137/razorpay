import { Router } from "express"
import { changePasswordValidation, loginValidation, registerValidation } from "../middlewares/validation.middleware.js";
import { changeCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const auth = Router();

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
auth.route("/register").post(registerValidation, registerUser);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
auth.route("/login").post(loginValidation, loginUser)

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
auth.route("/logout").post(verifyJWT, logoutUser)

// @route   POST /api/v1/auth/refresh-token
// @desc    Refresh Access token
// @access  Private
auth.route("/refresh-token").post(refreshAccessToken)

// @route   POST /api/v1/auth/change-password
// @desc    Change account password
// @access  Private
auth.route("/change-password").post(verifyJWT, changePasswordValidation, changeCurrentPassword)

export default auth;