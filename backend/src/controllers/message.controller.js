import { saveMessage, getMessages } from '../services/message.service.js';

export async function getAllMessages(req, res) {
    try{
        const messages = await getMessages();
        res.status(200).json(messages);
    }
    catch(err){
        console.error('Failed to get messages',err);
        res.status(500).json({error: 'Failed to get messages'});
    }

}

export async function createMessage(req, res) {
    try{
        const { text, senderId } = req.body;
        if (!text || !senderId) {
            return res.status(400).json({ error: 'Missing text or senderId' });
        }
        const message = await saveMessage({ text, senderId });
        res.status(201).json(message);
    }
    catch (err) {
        console.error('Failed to save message',err);
        res.status(500).json({error: 'Failed to save message'});
    }
}