import prisma from '../db/connect.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';


export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}


export function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
}


export async function createUser({ email, username, password }) {
    return await prisma.user.create({
        data: { email, username, password },
    });
}


export async function findUserByEmail(email) {
    return await prisma.user.findUnique({
        where: { email },
    });
}
