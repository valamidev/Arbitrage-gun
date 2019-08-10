"use strict"

/* Receive code */

const logger = require("../../logger")
const { Redis } = require("../redis")
const Emitter = require("../../emitter/emitter")

const Channel = "OrderBookUpdate"

Redis.subscribe(Channel, function(err, count) {
  logger.info(`Redis pub/sub channel subscribed count: ${count}`)
})

Redis.on("message", function(channel, message) {
  if (Channel == channel) {
    Emitter.emit(Channel, JSON.parse(message))
  }
})
