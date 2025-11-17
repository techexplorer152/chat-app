import prisma from "../db/connect.js";

export async function createUser({ email, password, username }) {

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password,
        },
    });

    return user;
}

export async function findUserByEmail(email) {
    return await prisma.user.findUnique({
        where: { email },
    });
}


export async function getAllUsers() {
    return await prisma.user.findMany({
        select: { id: true, username: true }
    });
}