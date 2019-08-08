"use strict"

// High Frequency strategies are connected directly into Eventemmiters and not capables for backtesting (yet)!

const logger = require("../../logger")
const ccxt_controller = require("../../exchange/ccxt_controller")

const { Redis } = require("../../redis/redis")
const Emitter = require("../../emitter/emitter")

const Channel = "ArbitrageSignal"

Redis.subscribe(Channel, function(err, count) {
  logger.info("Redis pub/sub channel subscribed count: ", count)
})

Redis.on("message", function(channel, message) {
  if (Channel == channel) {
    Emitter.emit(Channel, JSON.parse(message))
  }
})

function* create_arbitrage_circle(circle) {
  const exchangeAPI = ccxt_controller.load_exchange_api(circle.exchange)

  /*
    let response = await this.exchangeAPI.create_limit_sell_order(this.symbol, quantity, price)

        quantity = util.buy_quantity_by_symbol(quote_limit, price)
        let response = await this.exchangeAPI.create_limit_buy_order(this.symbol, quantity, price)
    */

  // First Buy
  let response = "sdasd"
  // Second Buy
  yield

  // Thirds Sell
  yield
}

async function check_order(id, symbol) {
  try {
    let order_info = await this.exchangeAPI.fetchOrder(id, symbol)

    logger.verbose(order_info)

    /*
          info: {}
          type: 'limit',
          side: 'sell',
          price: 0.0003186,
          amount: 3.13,
          cost: 0.00099721,
          average: 0.00031859744408945683,
          filled: 3.13,
          remaining: 1,
          status: 'open', / 'closed', / 'canceled'
        */

    if (order_info.status == "open") {
      logger.verbose(`Open order ${order_info.id} , ${order_info.amount}/${order_info.filled} , ${order_info.price}`)
    }

    if (order_info.status == "closed") {
      logger.verbose(`Order filled ${order_info.id} , ${order_info.filled} , ${order_info.price}`)

      await this.book_order(order_info)
    }
  } catch (e) {
    logger.error("Trade instance order check error ", e)
  }
}
