import { saveMessage } from '../services/message.service.js';

export default function setupChatSockets(io) {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('send_message', async ({ text, senderId }) => {
            if (!text || !senderId) return;
            const savedMessage = await saveMessage({ text, senderId });
            io.emit('receive_message', savedMessage);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}
