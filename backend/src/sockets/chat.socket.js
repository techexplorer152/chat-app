export default function setupChatSockets(io) {
    io.on('connection', (socket) => {
        socket.on('join_group', (groupId) => {
            socket.join(`group_${groupId}`);
        });

        socket.on('leave_group', (groupId) => {
            socket.leave(`group_${groupId}`);
        });

        socket.on('send_message', (payload) => {
            const { groupId, receiverId } = payload;

            if (groupId) {
                io.to(`group_${groupId}`).emit('receive_message', payload);
            } else if (receiverId) {
                io.emit('receive_message', payload);
            } else {
                io.emit('receive_message', payload);
            }
        });

        socket.on('delete_message', (payload) => {
            const { messageId, groupId } = payload;
            if (groupId) {
                io.to(`group_${groupId}`).emit('message_deleted', messageId);
            } else {
                io.emit('message_deleted', messageId);
            }
        });

        socket.on('disconnect', () => {
        });
    });
}