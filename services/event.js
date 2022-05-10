import { Client as WhatsappService } from '@services/whatsapp'
import WhatsappConfig from '@config/whatsapp.config'
import QrcodeTerminal from 'qrcode-terminal'

import { logger } from '@libs/logger'
import { notify } from '@services/webhook'
import { WaInstance, WaMessage } from '@models'
import { Events, WAState, NotifEvent, AckStatus } from './util/Constants'
import { Message, Acknowledge } from './models'

export class WaEventServices {

  constructor() {
    this.isLoaded = false
  }

  init(session = {}) {
    const instance = new WhatsappService({ ...WhatsappConfig, session })
    return instance
  }

  start(wa) {
    wa.initialize()
    WaInstance.findByPk(1).then(waInstance => {
      waInstance.running = true
      waInstance.save()
    })
  }

  load(wa) {
    wa.on(Events.STATE_CHANGED, async (state) => {
      if (!state) return

      const ACCEPTED_STATES = [WAState.CONNECTED, WAState.OPENING, WAState.PAIRING]
      const waInstance = await WaInstance.findByPk(1)

      if (state === WAState.TIMEOUT) {
        await waInstance.update({ connected: false })
        logger.warn(`Whatsapp connection lost!`)
        notify(NotifEvent.CONNECTION_LOSS)
        return
      }

      if (ACCEPTED_STATES.includes(state)) {
        logger.info(`Whatsapp connection appear!`)
        wa.emit(Events.READY, true)
      } else {
        await waInstance.update({ running: false, connected: false })
        await wa.destroy()
        logger.warn(`Whatsapp was logged out and disconnected! cause state ${state}`)
        notify(NotifEvent.DISCONNECTED)
        return
      }
    })

    wa.on(Events.READY, async (reconnected) => {
      logger.info('Whatsapp instance is running up!')
      const checkMessages = async () => {
        logger.info('Checking Unread messages!')
        await wa.loadUnreadMessages()

        logger.info('Checking changed messages status!')
        await wa.loadChangedMessageStatus()
      }

      const waInstance = await WaInstance.findByPk(1)

      await waInstance.update({
        running: true,
        connected: true,
      })

      if (!reconnected) {
        const me = await wa.getMe()
        await waInstance.update({
          phone_number: me.phone,
          display_name: me.displayName,
          profile_pic_thumb: me.profilePicThumb
        })
      }

      await checkMessages()
    })

    wa.on(Events.DISCONNECTED, async (reason) => {
      const waInstance = await WaInstance.findByPk(1)
      await waInstance.update({ running: false, connected: false })
      notify(NotifEvent.DISCONNECTED)
      logger.warn(`Whatsapp instance was disconnected! cause ${reason}`)
    })

    wa.on(Events.AUTHENTICATED, async (session) => {
      const waInstance = await WaInstance.findByPk(1)
      await waInstance.update({ ...session, connected: true })
      notify(NotifEvent.CONNECTED)
      logger.info(`Whatsapp connected to ${waInstance.last_wid || ''}`)
    })

    wa.on(Events.AUTHENTICATION_FAILURE, async () => {
      const waInstance = await WaInstance.findByPk(1)
      await waInstance.update({ connected: false })
      logger.warn('Whatsapp session is invalid or expired')
    })

    wa.on(Events.QR_RECEIVED, async (qr) => {
      const waInstance = await WaInstance.findByPk(1)
      let qr_status = ''
      let qr_code = ''

      const states = ['LOADING', 'CONNECTED']
      if (states.includes(qr)) {
        qr_status = qr
      } else {
        qr_status = 'READY'
        qr_code = qr
      }

      await waInstance.update({ qr_status, qr_code })

      if (process.env.NODE_ENV === 'development' && qr_code) {
        QrcodeTerminal.generate(qr_code, { small: true })
      }
    })

    wa.on(Events.MESSAGE_CREATE, async (msg) => {
      if (!msg) return
      let data = Message(msg)
      if (data.broadcast) return

      const ACCEPTED_BODY_TYPE = ['chat']
      if (!ACCEPTED_BODY_TYPE.includes(data.type) && data.body.length > 255) {
        data.body = ''
      }

      const [_, created] = await WaMessage.findOrCreate({
        where: {
          id: data.id
        },
        defaults: data
      })

      if (created) {
        const event = data.from_me ? NotifEvent.MESSAGE_SEND : NotifEvent.MESSAGE_RECEIVED
        notify(event, data)

        if (!data.from_me) {
          await wa.sendSeen(data.from)
        }
      }
    })

    wa.on(Events.ACK_CHANGED, async (msg) => {
      if (!msg) return
      const data = Acknowledge(msg)
      const message = await WaMessage.findByPk(data.id)

      if (message && message.status !== data.status) {
        await message.update({ status: data.status })
        notify(NotifEvent.MESSAGE_STATUS_CHANGED, { chat_id: data.id, status: data.status })
      }
    })

    this.isLoaded = true
  }
}
