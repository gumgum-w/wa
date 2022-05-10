import { index, start, scan, status } from './instance.action'
import { isRunning } from '@middlewares/whatsapp.middleware'

module.exports = {
  path: '/',
  '/': {
    get: {
      action: index,
      level: 'authenticated'
    }
  },
  '/start': {
    get: {
      action: start,
      level: 'authenticated'
    }
  },
  '/scan': {
    get: {
      action: scan,
      middlewares: [isRunning],
      level: 'authenticated'
    }
  },
  '/status': {
    get: {
      action: status,
      level: 'authenticated'
    }
  },
}
