export const chatSocket = {
  sendPrivateMessage: (send, chatRoomId, content, type = "TEXT", fileName = null) => {
    return send("/app/chat.send", { chatRoomId, content, type, fileName });
  },

  sendTypingEvent: (send, chatRoomId, senderId, typing) => {
    return send("/app/chat.typing", { chatRoomId, senderId, typing });
  },

  sendReadReceipt: (send, chatRoomId) => {
    return send("/app/chat.read", { chatRoomId });
  },

  sendReaction: (send, messageId, reaction) => {
    return send("/app/chat.reaction", { messageId, reaction });
  },

  sendEdit: (send, messageId, content) => {
    return send("/app/chat.edit", { messageId, content });
  },

  sendDeleteForEveryone: (send, messageId) => {
    return send("/app/chat.delete-for-everyone", messageId);
  },
};
