import prisma from '../db/connect.js';

export async function saveDirectMessage({ text, image_url, sender_id, receiver_id }) {
    return prisma.message.create({
        data: {
            text,
            imageUrl: image_url,
            senderId: Number(sender_id),
            receiverId: Number(receiver_id),
        },
    });
}

export async function getDirectMessages(user1Id, user2Id) {
    return prisma.message.findMany({
        where: {
            OR: [
                {
                    senderId: Number(user1Id),
                    receiverId: Number(user2Id),
                },
                {
                    senderId: Number(user2Id),
                    receiverId: Number(user1Id),
                },
            ],
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
}

export async function deleteMessage(id) {
    return await prisma.message.delete({
        where: {
            id: Number(id),
        },
    });
}