"use strict"

/* Receive code */

const { Redis } = require("../redis")
const Emitter = require("../../emitter/emitter")

const Channel = "OrderBookUpdate"

Redis.subscribe(Channel, function(err, count) {
  console.log("Redis pub/sub channel subscribed count", count)
})

Redis.on("message", function(channel, message) {
  if (Channel == channel) {
    Emitter.emit(Channel, JSON.parse(message))
  }

  // console.log("Receive message %s from channel %s", message, channel)
})
