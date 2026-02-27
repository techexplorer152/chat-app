import {
    saveDirectMessage,
    getDirectMessages,
    deleteMessage as removeMessage,
    saveGroupMessage,
    getGroupMessages
} from "../services/message.service.js";

export async function createMessage(req, res) {
    try {
        const { text, sender_id, receiver_id, groupId } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ error: "Message empty" });
        }

        let message;

        if (groupId) {
            message = await saveGroupMessage({
                text: text || null,
                image_url: imageUrl,
                sender_id: Number(sender_id),
                groupId: Number(groupId)
            });
        } else if (receiver_id) {
            message = await saveDirectMessage({
                text: text || null,
                image_url: imageUrl,
                sender_id: Number(sender_id),
                receiver_id: Number(receiver_id)
            });
        } else {
            return res.status(400).json({ error: "receiver_id or groupId required" });
        }

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

export async function getAllMessages(req, res) {
    try {
        const { user1, user2 } = req.query;

        if (!user1 || !user2) {
            return res.status(400).json({ error: "Both user IDs required" });
        }

        const messages = await getDirectMessages(
            Number(user1),
            Number(user2)
        );

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch" });
    }
}

export async function getGroupMessagesController(req, res) {
    try {
        const { groupId } = req.params;

        const messages = await getGroupMessages(Number(groupId));
        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch group messages" });
    }
}

export async function deleteMessage(req, res) {
    try {
        await removeMessage(Number(req.params.id));
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
        console.error(err);
        res.status(500).json({ error: "Delete failed" });
    }
}
