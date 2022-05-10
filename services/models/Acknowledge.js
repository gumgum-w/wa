import { AckStatus } from '../util/Constants'

module.exports = ({ id, ack }) => ({
  id,
  status: AckStatus[ack] || AckStatus.UNKNOWN
})
