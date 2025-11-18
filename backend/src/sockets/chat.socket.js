import { saveGroupMessage } from '../services/message.service.js';

export default function setupChatSockets(io) {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('send_message', async ({ text, sender_id }) => {
            if (!text || !sender_id) return;


            const savedMessage = await saveGroupMessage({ text, sender_id });


            io.emit('receive_message', savedMessage);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}
