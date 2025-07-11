import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


// Get User Profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user , "Profile fetched successfully")
    );
});


// Update User Profile
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

export {
    getProfile,
    updateProfile
};
