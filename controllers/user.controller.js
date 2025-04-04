import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name: name, email: email, password: hashedPassword });
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    //compare password received and db password for that user

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // console.log(token)
    // console.log(req.cookies.token) => undefined
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0, httpOnly: true })
      .json({
        success: true,
        message: "logged out successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to logout",
    });
  }
};
//token is stored in cookie
//as soon as we remove token from cookie user logged out
export const getUserProfile = async (req, res) => {
  try {
    //can see profile only by looged in user
    //if logged in user as checked by isAuthenticated then req.id would cntain userId

    const userId = req.id;
    const user = await User.findById(userId).select("-password"); // we dont need password
    if (!user) {
      return res.staus(404).josn({
        success: false,
        message: "profile not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to load user",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found ",
      });
    }
    //extract public id of the old image from the url if it exists
    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop().split(".")[0]; //extract public id
      deleteMediaFromCloudinary(publicId);
    }
    //upload new photo
    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoUrl = cloudResponse.secure_url;

    const updatedData = { name, photoUrl };
    //photo stored in cloudinary, gives secure url that can be used in frontend, backend, browser anywhere
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true })
      .select("-password");
    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to update profile",
    });
  }
};
