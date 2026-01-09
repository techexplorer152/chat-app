import prisma from '../db/connect.js';

export async function saveGroupMessage({ text, image_url, sender_id }) {
    return prisma.messages.create({
        data: {
            text,
            image_url,
            sender_id,
        },
    });
}

export async function getAllGroupMessages() {
    return prisma.messages.findMany({
        orderBy: { created_at: 'asc' },
    });
}
