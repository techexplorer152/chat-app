export default function setupChatSockets(io) {
    io.on('connection', (socket) => {
        socket.on('send_message', (payload) => {
            io.emit('receive_message', payload);
        });

        socket.on('delete_message', (messageId) => {
            io.emit('message_deleted', messageId);
        });

        socket.on('disconnect', () => {
        });
    });
}