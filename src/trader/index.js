/* eslint-disable require-atomic-updates */
"use strict"

const util = require("../utils")
const logger = require("../logger")
const Order = require("./order_manager")
const Emitter = require("../emitter/emitter")

class Trader {
  constructor(balances, quote_limits) {
    this.balances = balances
    this.quote_limits = quote_limits
  }

  start() {
    // Start event emitter
    Emitter.on("ArbitrageSignal", (circle) => {
      setImmediate(() => {
        const arbitrage_circle = JSON.parse(circle)

        this.create_arbitrage_circle(arbitrage_circle)
      })
    })
  }

  async create_arbitrage_circle(circle) {
    try {
      let ab = circle.a_symbol
      let bc = circle.b_symbol
      let cd = circle.c_symbol
      let main_quote = ab.quote

      let exchange = ab.exchange

      let balance = 0
      let quote_limit = 0

      if (typeof this.balances[exchange][main_quote] != "undefined" && typeof this.quote_limits[exchange][main_quote] != "undefined") {
        balance = this.balances[exchange][main_quote]
        quote_limit = this.quote_limits[exchange][main_quote]
      }

      if (balance == 0 || quote_limit == 0 || quote_limit > balance) {
        return
      }

      if (circle.direction == "forward") {
        logger.info(`Start arbitrage Balance: ${balance} , Exchange: ${exchange} Circle: ${ab.id}-${bc.id}-${cd.id} Direction: ${circle.direction} `)

        // BNBUSDT-WINBNB-WINUSDT ->
        let ab_order_config = { exchange, side: "buy", symbol: ab.symbol, quantity: quote_limit, price: ab.bid }
        let ab_order = new Order(ab_order_config)

        // Remove from Balance /* TODO add some other logic */
        this.balances[exchange][main_quote] -= quote_limit

        let amount_ab = await ab_order.execute()

        let bc_order_config = { exchange, side: "buy", symbol: bc.symbol, quantity: amount_ab, price: bc.bid }
        let bc_order = new Order(bc_order_config)

        let amount_bc = await bc_order.execute()

        let cd_order_config = { exchange, side: "sell", symbol: cd.symbol, quantity: amount_bc, price: cd.ask }
        let cd_order = new Order(cd_order_config)

        let amount_cd = await cd_order.execute()

        this.balances[exchange][main_quote] += amount_cd * cd.ask // Need to calculate sell value

        logger.info(`Arbitrage finished with ${amount_cd}`)
      }

      if (circle.direction == "backward") {
        logger.info(`Start arbitrage Balance: ${balance} , Exchange: ${exchange} Circle: ${ab.id}-${bc.id}-${cd.id} Direction: ${circle.direction} `)

        // BNBUSDT-WINBNB-WINUSDT <-

        let cd_order_config = { exchange, side: "buy", symbol: cd.symbol, quantity: quote_limit, price: cd.bid }
        let cd_order = new Order(cd_order_config)

        /* TODO add only remove if the Order were succesfuly created */
        this.balances[exchange][main_quote] -= quote_limit

        let amount_cd = await cd_order.execute()

        let bc_order_config = { exchange, side: "sell", symbol: bc.symbol, quantity: amount_cd, price: bc.ask }
        let bc_order = new Order(bc_order_config)

        let amount_bc = await bc_order.execute()

        amount_bc *= bc.ask // Need to calculate sell value

        let ab_order_config = { exchange, side: "sell", symbol: ab.symbol, quantity: amount_bc, price: ab.ask }
        let ab_order = new Order(ab_order_config)

        let amount_ab = await ab_order.execute()

        this.balances[exchange][main_quote] += amount_ab * ab.ask // Need to calculate sell value

        logger.info(`Arbitrage finished with ${amount_ab}`)
      }
    } catch (e) {
      logger.error("Arbitrage execute error: ", e)
    }
  }
}

module.exports = Trader
