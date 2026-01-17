import {
    saveGroupMessage,
    getAllGroupMessages,
    deleteGroupMessage
} from '../services/message.service.js';

export async function createMessage(req, res) {
    try {
        const { text, sender_id } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ error: 'Message empty' });
        }

        const message = await saveGroupMessage({
            text: text || null,
            image_url: imageUrl,
            sender_id: Number(sender_id),
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

export async function getAllMessages(req, res) {
    try {
        const messages = await getAllGroupMessages();
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
}

export async function deleteMessage(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID required' });
        }

        await deleteGroupMessage(id);
        res.status(200).json({ message: 'Deleted', id });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(500).json({ error: 'Delete failed' });
    }
}