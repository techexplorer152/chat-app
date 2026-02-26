import prisma from "../db/connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET || "refresh_secret",
        { expiresIn: "7d" }
    );
}

export async function createUser({ email, username, password }) {
    const hashedPassword = await hashPassword(password);
    return await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword
        },
    });
}

export async function findUserByEmail(email) {
    return await prisma.user.findUnique({
        where: { email },
    });
}

export async function findUserById(id) {
    return await prisma.user.findUnique({
        where: { id: Number(id) },
    });
}