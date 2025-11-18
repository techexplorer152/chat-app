import { saveGroupMessage, getAllGroupMessages } from '../services/message.service.js';

export async function getAllMessages(req, res) {
    try {
        const messages = await getAllGroupMessages();
        res.status(200).json(messages);
    } catch (err) {
        console.error('Failed to get messages', err);
        res.status(500).json({ error: 'Failed to get messages' });
    }
}

export async function createMessage(req, res) {
    try {
        const { text, sender_id } = req.body;
        if (!text || !sender_id) {
            return res.status(400).json({ error: 'Missing text or sender_id' });
        }
        const message = await saveGroupMessage({ text, sender_id });
        res.status(200).json(message);
    } catch (err) {
        console.error('Failed to save message', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
}
