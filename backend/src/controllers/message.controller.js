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
        console.log('REQ BODY:', req.body);
        console.log('REQ FILE:', req.file);

        const { text, sender_id } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ error: 'Message must have text or image' });
        }

        const message = await saveGroupMessage({
            text: text || null,
            image_url: imageUrl,
            sender_id: Number(sender_id),
        });

        res.status(201).json(message);
    } catch (err) {
        console.error('Failed to save message', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
}
