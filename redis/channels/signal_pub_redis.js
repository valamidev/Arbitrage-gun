"use strict"

/* Publish code */

const { Redis_pub } = require("../redis")
const Emitter = require("../../emitter/emitter")

const Channel = "ArbitrageSignal"

Emitter.on(Channel, (circle) => {
  setImmediate(() => {
    Redis_pub.publish(Channel, JSON.stringify(circle))
  })
})
