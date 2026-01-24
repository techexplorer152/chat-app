import {
    saveDirectMessage,
    getDirectMessages,
    deleteMessage as removeMessage
} from '../services/message.service.js';

export async function createMessage(req, res) {
    try {
        const { text, sender_id, receiver_id } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ error: 'Message empty' });
        }

        if (!receiver_id) {
            return res.status(400).json({ error: 'Receiver ID required' });
        }

        const message = await saveDirectMessage({
            text: text || null,
            image_url: imageUrl,
            sender_id: Number(sender_id),
            receiver_id: Number(receiver_id)
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export async function getAllMessages(req, res) {
    try {
        const { user1, user2 } = req.query;

        if (!user1 || !user2) {
            return res.status(400).json({ error: 'Both user IDs required' });
        }

        const messages = await getDirectMessages(user1, user2);
        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch' });
    }
}

export async function deleteMessage(req, res) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'ID required' });

        await removeMessage(id);
        res.status(200).json({ message: 'Deleted', id });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
        res.status(500).json({ error: 'Delete failed' });
    }
}