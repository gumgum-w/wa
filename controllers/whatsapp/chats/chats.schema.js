const { Joi, Segments, celebrate } = require('celebrate')
const mul = require('multer')

module.exports.messageSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    to: Joi.string().required(),
    body: Joi.string().required()
  })
})

module.exports.imageSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    to: Joi.string().required(),
    caption: Joi.string(),
  })
})

module.exports.imageFile = mul('image')

module.exports.file = mul('file')
