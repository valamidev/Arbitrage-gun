/* eslint-disable require-atomic-updates */
"use strict"

// High Frequency strategies are connected directly into Eventemmiters and not capables for backtesting (yet)!
const util = require("../utils")
const logger = require("../logger")
const Order = require("./order_manager")
const Emitter = require("../emitter/emitter")

let balance = 0.0015 // BTC

Emitter.on("ArbitrageSignal", (circle) => {
  setImmediate(() => {
    const arbitrage_circle = JSON.parse(circle)

    create_arbitrage_circle(arbitrage_circle)
  })
})

async function create_arbitrage_circle(circle) {
  /* TODO remove BTC only */
  if (circle.a_symbol.quote != "BTC" || circle.a_symbol.exchange != "binance") {
    return
  }

  if (balance == 0) {
    return
  }

  let ab = circle.a_symbol
  let bc = circle.b_symbol
  let cd = circle.c_symbol
  let exchange = ab.exchange

  logger.info(
    `Start arbitrage Balance: ${balance} , Exchange: ${exchange} Circle: ${JSON.stringify(ab)}-${JSON.stringify(bc)}-${JSON.stringify(cd)} Direction: ${circle.direction} `
  )

  balance = 0

  if (circle.direction == "forward") {
    // BNBUSDT-WINBNB-WINUSDT ->
    let quantity_ab = util.buy_quantity_by_symbol(balance, circle.a_symbol.bid)
    let ab_order_config = { exchange, side: "buy", symbol: ab.symbol, quantity: quantity_ab, price: ab.bid }
    let ab_order = new Order(ab_order_config)

    balance = 0
    let amount_ab = await ab_order.execute()

    let quantity_bc = util.buy_quantity_by_symbol(amount_ab, circle.b_symbol.bid)
    let bc_order_config = { exchange, side: "buy", symbol: bc.symbol, quantity: quantity_bc, price: bc.bid }
    let bc_order = new Order(bc_order_config)

    let amount_bc = await bc_order.execute()

    let cd_order_config = { exchange, side: "sell", symbol: cd.symbol, quantity: amount_bc, price: cd.ask }
    let cd_order = new Order(cd_order_config)

    let amount_cd = await cd_order.execute()

    logger.verbose(`Arbitrage finished with ${amount_cd}`)

    balance += amount_cd
  }
}
