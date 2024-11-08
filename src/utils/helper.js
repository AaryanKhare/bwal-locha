import dotenv from "dotenv"
import User from "../models/user";
import ApiError from "./ApiError";
import jwt from "jsonwebtoken";
import { AUTH_FAILED } from "../constants";

dotenv.config();

export const appConfig = {
    debug: process.env.APP_DEBUG === 'true' || false,

    // Access Token
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "",

    // Refresh Token
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "",

    // Database
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // MongoDB Database
    MONGODB_URI: process.env.MONGODB_URI
}

export async function generateTokens(userId) {

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(401, AUTH_FAILED)
        }

        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "An occurred while generating access and refresh tokens")
    }
}

export function generateAccessToken(userId) {
    return jwt.sign({
        _id: userId,
    }, appConfig.ACCESS_TOKEN_SECRET, {
        expiresIn: appConfig.ACCESS_TOKEN_EXPIRY
    })
}

export function generateRefreshToken(userId) {
    return jwt.sign({
        _id: userId,
    }, appConfig.REFRESH_TOKEN_SECRET, {
        expiresIn: appConfig.REFRESH_TOKEN_EXPIRY
    })
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, appConfig.ACCESS_TOKEN_SECRET)

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token has expired.', error);
        }
        throw new ApiError(401, 'Invalid token');;
    }
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, appConfig.REFRESH_TOKEN_SECRET)
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token has expired.', );
        }
        throw new ApiError(401, 'Invalid token');;
    }
}