import { WaInstance } from '@models'

export async function isRunning(req, res, next) {
  const instance = await WaInstance.findByPk(1)
  if (!instance.running) {
    return res.status(403).json({ detail: 'whatsapp instance is not running' })
  }

  next()
}

export async function isConnected(req, res, next) {
  const instance = await WaInstance.findByPk(1)

  if (!instance.connected) {
    return res.status(403).json({ detail: 'whatsapp instance is not connected' })
  }

  next()
}
