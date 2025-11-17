import prisma from '../db/connect.js';

export async function saveMessage({ text, senderId }) {
    return await prisma.messages.create({
        data: { text, sender_id: senderId },
    });
}

export async function getMessages() {
    return await prisma.messages.findMany({
        orderBy: { created_at: 'asc' }
    });
}
