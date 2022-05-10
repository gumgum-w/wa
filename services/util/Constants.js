'use strict';

exports.WhatsWebURL = 'https://web.whatsapp.com/'

exports.UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36';

exports.DefaultOptions = {
  puppeteer: {
    headless: true
  },
  session: false
}

exports.Status = {
  INITIALIZING: 0,
  AUTHENTICATING: 1,
  READY: 3
}

exports.AckStatus = {
  0: 'PENDING',
  1: 'RECEIVED',
  2: 'DELIVERED',
  3: 'READ',
  4: 'PLAYED',
  UNKNOWN: 'UNKNOWN'
}

exports.Events = {
  AUTHENTICATED: 'authenticated',
  AUTHENTICATION_FAILURE: 'auth_failure',
  READY: 'ready',
  MESSAGE_RECEIVED: 'message',
  MESSAGE_CREATE: 'message_create',
  QR_RECEIVED: 'qr',
  DISCONNECTED: 'disconnected',
  STATE_CHANGED: 'state_changed',
  ACK_CHANGED: 'ack_changed'
}

exports.MessageTypes = {
  TEXT: 'chat',
  AUDIO: 'audio',
  VOICE: 'ptt',
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  STICKER: 'sticker'
}

exports.ChatTypes = {
  SOLO: 'solo',
  GROUP: 'group',
  UNKNOWN: 'unknown'
}

exports.WAState = {
  CONFLICT: "CONFLICT",
  CONNECTED: "CONNECTED",
  DEPRECATED_VERSION: "DEPRECATED_VERSION",
  OPENING: "OPENING",
  PAIRING: "PAIRING",
  PROXYBLOCK: "PROXYBLOCK",
  SMB_TOS_BLOCK: "SMB_TOS_BLOCK",
  TIMEOUT: "TIMEOUT", // internet loss
  TOS_BLOCK: "TOS_BLOCK",
  UNLAUNCHED: "UNLAUNCHED",
  UNPAIRED: "UNPAIRED",
  UNPAIRED_IDLE: "UNPAIRED_IDLE"
}

exports.QrState = {
  LOADING: 'LOADING',
  CONNECTED: 'CONNECTED'
}

exports.NotifEvent = {
  CONNECTION_LOSS: 'WA_INSTANCE_CONNECTION_LOSS',
  DISCONNECTED: 'WA_INSTANCE_DISCONNECTED',
  CONNECTED: 'WA_INSTANCE_CONNECTED',
  MESSAGE_SEND: 'WA_MESSAGE_SEND',
  MESSAGE_RECEIVED: 'WA_MESSAGE_RECEIVED',
  MESSAGE_STATUS_CHANGED: 'WA_MESSAGE_STATUS_CHANGED'
}
