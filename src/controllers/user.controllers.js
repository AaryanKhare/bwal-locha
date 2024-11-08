import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    //TODO
    if (
        [fullname, username, email, password].some((field) => field?.trim() == "")
    ) {
        throw new ApiError(400, "all fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "user already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;

    // if(!avatarLocalPath){
    //     throw new ApiError(400, "avatar is missing");
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // let coverImage = ""
    // if(coverLocalPath){
    //     coverImage = await uploadOnCloudinary(coverLocalPath);
    // }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("uploaded avatar", avatar)
    }
    catch (error) {
        console.log("error uploading avatar", error)
        throw new ApiError(500, "failed to update avatar");
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("uploaded coverImage", coverImage)
    }
    catch (error) {
        console.log("error uploading coverImage", error)
        throw new ApiError(500, "failed to update coverImage");
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            username: username.toLowerCase(),
            password
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "something went wrong while registering a user");
        }
        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully"))
    } catch (error) {
        console.log("user creation failed")
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }       

        throw new ApiError(500, "something went wrong while registering user")
    }
})

export {
    registerUser,
};