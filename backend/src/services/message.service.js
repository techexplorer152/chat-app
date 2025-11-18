import prisma from '../db/connect.js';



export async function saveGroupMessage({ text, sender_id }) {
    return await prisma.messages.create({
        data: { text, sender_id },
    });
}


export async function getAllGroupMessages() {
    return await prisma.messages.findMany({
        orderBy: { created_at: 'asc' },
    });
}
