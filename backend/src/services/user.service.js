import prisma from "../db/connect.js";
import bcrypt from "bcrypt";

export async function createUser({ email, password,username }) {

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    return user;
}

export async function findUserByEmail(email){
    return await prisma.user.findUnique({
        where: {email}
    })
}
