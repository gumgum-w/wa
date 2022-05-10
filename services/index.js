import path from 'path'
import EventEmitter from 'events'
import puppeteer from 'puppeteer'
import jsQR from 'jsqr'
import OnDeath from 'death'
import Util from './util/Util'
import { WhatsWebURL, UserAgent, DefaultOptions, Events, QrState } from './util/Constants'

class Client extends EventEmitter {

  constructor(options = {}) {
    super()
    this.options = Util.mergeDefault(DefaultOptions, options)
    this.pupBrowser = null
    this.pupPage = null
    this.connected = false
    this.timer = null
    this.maxScanRetry = 10
    this.scanRetry = 0
  }

  async initialize() {
    let browser

    if (this.options.browserless) {
      browser = await puppeteer.connect(this.options.browserless)
    } else {
      browser = await puppeteer.launch(this.options.puppeteer)
    }

    browser.on('disconnected', () => {
      this.emit(Events.DISCONNECTED, 'Browser closed')
    })

    // OnDeath(async () => {
    //   await this.destroy()
    // })

    const page = await browser.newPage()
    page.setUserAgent(UserAgent)

    if (this.options.session) {
      await this.restoreSession(page, this.options.session)
    }

    await page.goto(WhatsWebURL)

    this.pupBrowser = browser
    this.pupPage = page
    // check if session was successfully restored
    const sessionValid = await this.isSessionValid(page)
    if (!sessionValid) {
      this.emit(Events.AUTHENTICATION_FAILURE, 'Invalid session')
    }

    await this.waitForConnected()

  }

  async waitForConnected() {
    this.scanRetry++

    console.log(`=> ${this.scanRetry} : scan qrcode`)
    if (this.scanRetry >= this.maxScanRetry) {
      this.emit(Events.DISCONNECTED)
      await this.destroy()
    }

    try {
      const connected = await this.isConnected()

      if (connected) {
        const session = await this.stillSession(this.pupPage)
        this.emit(Events.AUTHENTICATED, session)
        await this.inject()
        return
      } else {
        const qr = await this.scanQrCode()
        this.emit(Events.QR_RECEIVED, qr)
        await setTimeout(async () => {
          await this.waitForConnected()
        }, 10000)
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        await this.waitForConnected()
      }
    }
  }

  async destroy() {
    if (this.options.browserless) {
      await this.pupBrowser.disconnect()
    } else {
      await this.pupBrowser.close()
    }
  }

  async inject() {
    const wapi = path.join(__dirname, 'scripts/wapi.js')
    await this.pupPage.addScriptTag({ path: require.resolve(wapi) })

    await this.pupPage.waitForFunction('window.Store !== undefined')

    // Register events
    await this.pupPage.exposeFunction('onAddMessageEvent', msg => {
      if (!msg.isNewMsg) return

      this.emit(Events.MESSAGE_CREATE, msg)

      if (msg.sender.isMe) return
      this.emit(Events.MESSAGE_RECEIVED, msg)
    })

    await this.pupPage.exposeFunction('onAppStateChangedEvent', (AppState, state) => {
      this.emit(Events.STATE_CHANGED, state)
    })

    await this.pupPage.exposeFunction('onChangeAckEvent', data => {
      this.emit(Events.ACK_CHANGED, { id: data.id._serialized, ack: data.ack })
    })

    await this.pupPage.evaluate(() => {
      window.WAPI.onAppStateChanged(window["onAppStateChangedEvent"])
      window.WAPI.addAllNewMessagesListener(window["onAddMessageEvent"])
      window.WAPI.waitNewAcknowledgements(window["onChangeAckEvent"])
    }).catch(err => console.log(err.message))

    this.emit(Events.READY)
  }

  async stillSession(page) {
    const localStorage = JSON.parse(await page.evaluate(() => {
      return JSON.stringify(window.localStorage)
    }))

    const session = {
      browser_id: localStorage.WABrowserId,
      secret_bundle: localStorage.WASecretBundle,
      token1: localStorage.WAToken1,
      token2: localStorage.WAToken2,
      last_wid: localStorage['last-wid']
    }

    return session
  }

  async restoreSession(page, session) {
    await page.evaluateOnNewDocument(session => {
      localStorage.clear()
      localStorage.setItem('WABrowserId', session.browser_id)
      localStorage.setItem('WASecretBundle', session.secret_bundle)
      localStorage.setItem('WAToken1', session.token1)
      localStorage.setItem('WAToken2', session.token2)
    }, session)
  }

  async isSessionValid(page) {
    const KEEP_PHONE_CONNECTED_IMG_SELECTOR = '[data-asset-intro-image="true"]'

    try {
      await page.waitForSelector(KEEP_PHONE_CONNECTED_IMG_SELECTOR, { timeout: 10000 })
      this.connected = true
      return true
    } catch (error) {
      if (error.name === 'TimeoutError') {
        this.connected = false
        return false
      }

      throw error
    }
  }

  async isConnected() {
    if (!this.pupBrowser || !this.pupPage) {
      return false
    }

    const connected = await this.pupPage.evaluate("localStorage['last-wid']")
    return Boolean(connected)
  }

  async scanQrCode() {
    // if (!this.pupPage) {
    //   return QrState.LOADING
    // }
    await this.isSessionValid(this.pupPage)

    if (this.connected) {
      return QrState.CONNECTED
    }

    const QR_CANVAS_SELECTOR = 'canvas'
    const QR_RETRY_SELECTOR = 'div[data-ref] > span > div'
    const qrRetry = await this.pupPage.$(QR_RETRY_SELECTOR)
    if (qrRetry) {
      await qrRetry.click()
    }

    await this.pupPage.waitForSelector(QR_CANVAS_SELECTOR)
    const qrImgData = await this.pupPage.$eval(QR_CANVAS_SELECTOR, canvas => [].slice.call(canvas.getContext('2d').getImageData(0, 0, 264, 264).data));
    const qr = jsQR(qrImgData, 264, 264).data;

    return qr

  }

  async loadUnreadMessages() {
    let chats = await this.pupPage.evaluate(() => {
      let result = []
      try {
        result = WAPI.getUnreadMessages(false, false, true)
      } catch (_) { }

      return JSON.stringify(result)
    })

    if (!chats) return
    chats = JSON.parse(chats)
    chats.map(chat => {
      chat.messages.map(message => {
        this.emit(Events.MESSAGE_CREATE, message)
      })
    })
  }

  async loadChangedMessageStatus() {
    let chats = await this.pupPage.evaluate(() => {
      const result = [];
      Store.Chat.models
        .filter((chat) => {
          let last = chat.msgs._last
          if (last && (last.id && last.id.fromMe)) {
            return true;
          }
          return false
        })
        .map((chat) => {
          result.push({
            id: chat.msgs._last.id._serialized,
            ack: chat.msgs._last.ack
          })
        })
      return JSON.stringify(result)
    })

    if (!chats) return
    chats = JSON.parse(chats)

    chats.map(chat => {
      this.emit(Events.ACK_CHANGED, chat)
    })
  }

  async sendSeen(id) {
    await this.pupPage.evaluate((id) => {
      try {
        WAPI.sendSeen(id)
        return true
      } catch (error) {
        return false
      }
    }, id)
  }

  async sendMessage(to, body) {
    let sent = false
    const { canSend, reason, isGroup } = await this.validateUser(to)

    if (canSend) {
      sent = await this.pupPage.evaluate((to, body, isGroup) => {
        try {
          if (isGroup) {
            return WAPI.sendMessage(to, body)
          } else {
            WAPI.sendMessageToID(to, body)
            return true
          }
        } catch (error) {
          return false
        }
      }, to, body, isGroup)
    }

    return { sent, reason }
  }

  async sendImage(to, filename, caption, body) {
    let sent = false
    const { canSend, reason } = await this.validateUser(to)

    if (canSend) {
      sent = await this.pupPage.evaluate((to, filename, caption, body) => {
        try {
          WAPI.sendImage(body, to, filename, caption)
          return true
        } catch (error) {
          return false
        }
      }, to, filename, caption, body)
    }

    return { sent, reason }
  }

  async sendFile(to, filename, caption, body) {
    let sent = false
    const { canSend, reason } = await this.validateUser(to)

    if (canSend) {
      sent = await this.pupPage.evaluate((to, filename, caption, body) => {
        try {
          WAPI.sendFile(body, to, filename, caption)
          return true
        } catch (error) {
          return false
        }
      }, to, filename, caption, body)
    }

    return { sent, reason }
  }

  // UTILITIES
  async getUser(chatId) {
    const user = await this.pupPage.evaluate((chatId) => {
      return WAPI.checkNumberStatus(chatId)
    }, chatId)

    return user
  }

  async validateUser(chatId) {
    let data = {
      canSend: false,
      reason: "",
      isGroup: false
    }
    const acceptedDomains = ['@c.us', '@g.us']
    const domain = chatId.substring(chatId.length - 5)
    if (!acceptedDomains.includes(domain)) {
      return { ...data, reason: "id not valid" }
    }

    data.isGroup = domain === '@g.us'
    if (!data.isGroup) {
      const user = await this.getUser(chatId)
      return {
        ...data,
        canSend: user.numberExists && user.canReceiveMessage,
        reason: !user.numberExists ? "number not registered" : !user.canReceiveMessage ? "has been blocked by you or by user" : ""
      }
    } else {
      return {
        ...data,
        canSend: true,
        reason: ""
      }
    }

  }

  async getMe() {
    const profile = await this.pupPage.evaluate(() => JSON.stringify(window.WAPI.getMe()))

    return JSON.parse(profile)
  }

  // GROUPS
  async getGroups() {
    let groups = await this.pupPage.evaluate(() => {
      let result = []
      try {
        result = WAPI.getAllGroups()
      } catch (_) { }
      return JSON.stringify(result)
    })
    if (!groups) return
    groups = JSON.parse(groups)
    groups = groups.map(({ id, name }) => ({ id, name }))
    return groups
  }

}

export {
  Client
}
