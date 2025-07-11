import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { updateProfileValidation } from "../middlewares/validation.middleware";

const user = Router();

// @route   GET /api/v1/user/profile
// @desc    Get user profile
// @access  Private
user.route("/profile").get(verifyJWT, getProfile)

// @route   PUT /api/v1/user/profile
// @desc    Update user profile
// @access  Private
user.route("/profile").put(verifyJWT, updateProfileValidation, updateProfile)

export default user;