import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";

export function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });
}