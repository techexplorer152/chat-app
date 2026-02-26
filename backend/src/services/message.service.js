import prisma from '../db/connect.js';

export async function saveDirectMessage({ text, image_url, sender_id, receiver_id }) {
    const sId = Number(sender_id);
    const rId = Number(receiver_id);

    if (isNaN(sId) || isNaN(rId)) {
        throw new Error("Invalid Sender or Receiver ID");
    }

    return await prisma.message.create({
        data: {
            text: text || null,
            imageUrl: image_url || null,
            senderId: sId,
            receiverId: rId,
        },
        include: {
            sender: {
                select: { id: true, username: true }
            }
        }
    });
}

export async function saveGroupMessage({ text, image_url, sender_id, groupId }) {
    const sId = Number(sender_id);
    const gId = Number(groupId);

    if (isNaN(sId) || isNaN(gId)) {
        throw new Error("Invalid Sender or Group ID");
    }

    return await prisma.message.create({
        data: {
            text: text || null,
            imageUrl: image_url || null,
            senderId: sId,
            groupId: gId,
        },
        include: {
            sender: {
                select: { id: true, username: true }
            }
        }
    });
}

export async function getDirectMessages(user1Id, user2Id) {
    const id1 = Number(user1Id);
    const id2 = Number(user2Id);

    return await prisma.message.findMany({
        where: {
            OR: [
                { senderId: id1, receiverId: id2 },
                { senderId: id2, receiverId: id1 },
            ],
        },
        include: {
            sender: {
                select: { id: true, username: true }
            }
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
}

export async function getGroupMessages(groupId) {
    const gId = Number(groupId);

    return await prisma.message.findMany({
        where: {
            groupId: gId,
        },
        include: {
            sender: {
                select: { id: true, username: true }
            }
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