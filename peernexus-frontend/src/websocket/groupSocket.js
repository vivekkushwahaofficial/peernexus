export const groupSocket = {
  sendGroupMessage: (send, groupId, content, type = "TEXT", fileName = null) => {
    return send("/app/group.send", { groupId, content, type, fileName });
  },

  sendGroupTyping: (send, groupId, senderId, typing) => {
    return send("/app/group.typing", { groupId, senderId, typing });
  },

  sendGroupReadReceipt: (send, groupId) => {
    return send("/app/group.read", { groupId });
  },
};
