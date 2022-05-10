const { WaMessage } = '@models'

module.exports.getMessages = async (req, res) => {
  const messages = await WaMessage.findAll({
    order: [
      ['created_at', 'DESC']
    ]
  })
  return res.status(200).json(messages)
}

module.exports.sendMessage = async (req, res) => {
  const { to, body } = req.body
  const result = await req.whatsapp.sendMessage(to, body)

  return res.status(result ? 200 : 403).json(result)
}

module.exports.sendImage = async (req, res) => {
  const { to, caption } = req.body
  const filename = req.file.originalname
  const mimetype = req.file.mimetype
  const base64 = req.file.buffer.toString('base64')
  const body = `data:${mimetype};base64,${base64}`
  const result = await req.whatsapp.sendImage(to, filename, caption, body)
  return res.status(result ? 200 : 403).json(result)
}

module.exports.sendFile = async (req, res) => {
  const { to, caption } = req.body
  const filename = req.file.originalname
  const mimetype = req.file.mimetype
  const base64 = req.file.buffer.toString('base64')
  const body = `data:${mimetype};base64,${base64}`
  const result = await req.whatsapp.sendFile(to, filename, caption, body)
  return res.status(result ? 200 : 403).json(result)
}
