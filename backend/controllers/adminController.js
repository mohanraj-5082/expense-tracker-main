const User = require("../models/User");

/**
 * @route  GET /api/admin/users
 * @access Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PATCH /api/admin/users/:id/verify
 * @access Private (Admin only)
 */
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been verified`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, verifyUser };
