import prisma from "../db/connect.js";

export const createGroupAndAddOwner = async (name, description, ownerId) => {
    return await prisma.group.create({
        data: {
            name,
            description,
            members: {
                create: {
                    userId: ownerId,
                    role: "admin",
                },
            },
        },
        include: {
            members: true,
        },
    });
};

export const findGroupsByUserId = async (userId) => {
    return await prisma.group.findMany({
        where: {
            members: {
                some: { userId },
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, username: true },
                    },
                },
            },
        },
    });
};

export const addUserToGroup = async (groupId, userId) => {
    return await prisma.groupMember.create({
        data: {
            groupId: parseInt(groupId),
            userId: parseInt(userId),
            role: "member",
        },
    });
};