import prisma from '../db/connect.js';

export async function saveDirectMessage({ text, image_url, sender_id, receiver_id }) {
    return prisma.messages.create({
        data: {
            text,
            image_url,
            sender_id: Number(sender_id),
            receiver_id: Number(receiver_id),
        },
    });
}

export async function getDirectMessages(user1Id, user2Id) {
    return prisma.messages.findMany({
        where: {
            OR: [
                {
                    sender_id: Number(user1Id),
                    receiver_id: Number(user2Id),
                },
                {
                    sender_id: Number(user2Id),
                    receiver_id: Number(user1Id),
                },
            ],
        },
        orderBy: {
            created_at: 'asc',
        },
    });
}

export async function deleteMessage(id) {
    return await prisma.messages.delete({
        where: {
            id: Number(id),
        },
    });
}