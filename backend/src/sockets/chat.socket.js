export default function setupChatSockets(io) {
    io.on('connection', (socket) => {
        socket.on('send_message', (payload) => {
            socket.broadcast.emit('receive_message', payload);
        });

        socket.on('disconnect', () => {
        });
    });
}