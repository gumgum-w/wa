const { sendMessage, sendImage, getMessages, sendFile } = './chats.action'
const { isRunning, isConnected } = '@middlewares/whatsapp.middleware'
// const { messageSchema, imageSchema, imageFile, file } = './chats.schema'

module.exports = {
  path: '/',
  '/messages': {
    get: {
      action: getMessages,
      middlewares: [],
      level: 'public'
    }
  },
  '/sendMessage': {
    post: {
      action: sendMessage,
      middlewares: [isRunning, isConnected],
      level: 'public'
    }
  },
  '/sendImage': {
    post: {
      action: sendImage,
      middlewares: [isRunning, isConnected],
      level: 'public'
    }
  },
  '/sendFile': {
    post: {
      action: sendFile,
      middlewares: [isRunning, isConnected],
      level: 'public'
    }
  }
}
