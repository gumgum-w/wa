const { WaEventServices } = '@services/whatsapp/event' 
const { Client } = '@services/whatsapp'
const { WaInstance } = '@models'

export default (app) => {
  let waEventService = null
  let whatsapp = null

  app.use(async (req, res, next) => {
    if (!(waEventService instanceof WaEventServices)) {
      waEventService = new WaEventServices()
    }

    if (!(whatsapp instanceof Client)) {
      const session = await WaInstance.findByPk(1)
      whatsapp = waEventService.init(session.dataValues)
    }

    req.waeventservice = waEventService
    req.whatsapp = whatsapp
    next()
  })
}
