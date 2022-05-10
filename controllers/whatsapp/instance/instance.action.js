import qrcode from 'qrcode'
import { WaInstance } from '@models'

module.exports.index = async (req, res) => {
  return res.send('Whatsapp Service Instance')
}

module.exports.start = async (req, res) => {
  const instance = await WaInstance.findByPk(1)
  const page = req.whatsapp.pupPage

  if (!instance.running || page === null) {
    req.waeventservice.start(req.whatsapp)
    req.whatsapp.scanRetry = 0

    if (!req.waeventservice.isLoaded) {
      req.waeventservice.load(req.whatsapp)
    }
  }

  return res.status(200).send({ detail: 'Whatsapp instance started' })
}

module.exports.scan = async (req, res) => {
  const { type } = req.query
  const instance = await WaInstance.findByPk(1)

  if (instance.connected) {
    return res.send({ detail: `Whatsapp connected to ${instance.last_wid}` })
  }

  const { qr_status, qr_code } = instance
  const qr_code_base64 = qr_code ? await qrcode.toDataURL(qr_code) : null

  if (type === 'json') {
    return res.status(200).json({ qr_status, qr_code, qr_code_base64 })
  }

  return res.render('scan', { qr_status, qr_code, qr_code_base64 })
}

module.exports.status = async (req, res) => {
  const instance = await WaInstance.findOne({
    where: {
      id: 1
    },
    attributes: [
      'running',
      'connected',
      'phone_number',
      'display_name',
      'profile_pic_thumb'
    ]
  })

  return res.status(200).json(instance)
}

