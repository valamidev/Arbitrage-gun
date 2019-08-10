"use strict"

const Emitter = require("../emitter/emitter")

const Channel = "OrderBookUpdate"

class Arbitrage {
  constructor(symbols) {
    // Exhcange, CCXT symbol ,Id, Price, Quote, Asset
    this.symbols = symbols
    this.quotes = ["BTC", "ETH", "XRP", "BNB", "USDT"]
    this.combinations = []
    this.signals = new Map()
    this.fee = 0.001
    this.min_profit = 1.001
    this.singal_timeout = 60000 // 1 min
  }

  start() {
    Emitter.on(Channel, (msg) => {
      let update = 0

      for (let i = 0; i < this.symbols.length; i++) {
        const symbol = this.symbols[i]

        if (symbol.id == msg.symbol && symbol.exchange == msg.exchange) {
          symbol.ask = msg.ask.price || 0
          symbol.bid = msg.bid.price || 0

          update++
        }
      }

      if (update > 0) {
        this.evaluate_combinations()
      }
    })
  }

  create_combinations() {
    let id = 1

    let combinations = []
    for (let i = 0; i < this.symbols.length; i++) {
      let a_symbol = this.symbols[i]
      if (arbitrage_symbol(a_symbol, this.quotes)) {
        for (let j = 0; j < this.symbols.length; j++) {
          let b_symbol = this.symbols[j]
          if (b_symbol.quote == a_symbol.asset && b_symbol.exchange == a_symbol.exchange) {
            for (let k = 0; k < this.symbols.length; k++) {
              let c_symbol = this.symbols[k]

              if (c_symbol.quote == a_symbol.quote && c_symbol.asset == b_symbol.asset && b_symbol.exchange == c_symbol.exchange) {
                combinations.push({ id, a_symbol, b_symbol, c_symbol })
                id++
              }
            }
          }
        }
      }
    }
    this.combinations = combinations
  }

  evaluate_combinations() {
    for (let i = 0; i < this.combinations.length; i++) {
      const circle = this.combinations[i]

      if (circle.a_symbol.ask == 0 || circle.b_symbol.ask == 0 || circle.c_symbol.ask == 0 || circle.a_symbol.bid == 0 || circle.b_symbol.bid == 0 || circle.c_symbol.bid == 0) {
        continue
      }

      let direction = "forward"

      // BNBUSDT-WINBNB-WINUSDT ->

      let entry = 1

      let result_1 = trade_buy(entry, circle.a_symbol.bid)

      let result_2 = trade_buy(result_1, circle.b_symbol.bid)

      let result_3 = trade_sell(result_2, circle.c_symbol.ask)

      let result = result_3 / (1 + this.fee * 3)

      // BNBUSDT-WINBNB-WINUSDT <-

      entry = 1

      result_1 = trade_buy(entry, circle.c_symbol.bid)

      result_2 = trade_sell(result_1, circle.b_symbol.ask)

      result_3 = trade_sell(result_2, circle.a_symbol.ask)

      let result_backward = result_3 / (1 + this.fee * 3)

      if (result_backward > result) {
        result = result_backward
        direction = "backward"
      }

      circle.result = result
      circle.direction = direction

      if (circle.result > this.min_profit) {
        this.add_signal(circle)
      }
    }
  }

  add_signal(circle) {
    let time = Date.now()

    // Slow down signals 1 / per minute (or other value)
    this.signals.forEach((value, key) => {
      if (value + this.singal_timeout < time) {
        this.signals.delete(key)
      }
    })

    if (typeof this.signals.get(circle.id) == "undefined") {
      this.signals.set(circle.id, time)
      Emitter.emit("ArbitrageSignal", JSON.stringify(circle))
      // console.log(`${circle.a_symbol.exchange}: ${circle.a_symbol.id}-${circle.b_symbol.id}-${circle.c_symbol.id} :`, circle.result, circle.direction, time)
      // console.log(`${circle.a_symbol.ask}: ${circle.b_symbol.ask}-${circle.c_symbol.bid}`)
    }
  }
}

// Ask
const trade_buy = (balance, price) => {
  return balance / price
}

// Bid
const trade_sell = (balance, price) => {
  return balance * price
}

const arbitrage_symbol = (symbol, quotes) => {
  return Boolean(quotes.indexOf(symbol.quote) != -1 && quotes.indexOf(symbol.asset) != -1)
}

module.exports = Arbitrage

/*
create_combinations4step() {
    let combinations4 = []
    for (let i = 0; i < this.symbols.length; i++) {
      let a_symbol = this.symbols[i]
      if (arbitrage_symbol(a_symbol, this.quotes)) {
        for (let j = 0; j < this.symbols.length; j++) {
          let b_symbol = this.symbols[j]

          if (b_symbol.quote == a_symbol.asset && b_symbol.exchange == a_symbol.exchange) {
            for (let l = 0; l < this.symbols.length; l++) {
              const c_symbol = this.symbols[l]

              if (c_symbol.asset == b_symbol.asset && c_symbol.quote != b_symbol.quote && b_symbol.exchange == c_symbol.exchange) {
                for (let k = 0; k < this.symbols.length; k++) {
                  let d_symbol = this.symbols[k]

                  if (d_symbol.quote == a_symbol.quote && d_symbol.asset == c_symbol.quote && d_symbol.exchange == c_symbol.exchange) {
                    combinations4.push({ id: i, a_symbol, b_symbol, c_symbol, d_symbol })
                  }
                }
              }
            }
          }
        }
      }
    }
    this.combinations4 = combinations4
  }

  evaluate_combinations4step() {
    for (let i = 0; i < this.combinations4.length; i++) {
      const circle = this.combinations4[i]

      if (circle.a_symbol.ask == 0 || circle.b_symbol.ask == 0 || circle.c_symbol.bid == 0 || circle.d_symbol.bid == 0) {
        continue
      }

      let entry = 1

      let result_a = trade_buy(entry, circle.a_symbol.ask) // BNBBTC

      let result_b = trade_buy(result_a, circle.b_symbol.ask) // ADABNB

      let result_c = trade_sell(result_b, circle.c_symbol.bid) // ADAETH

      let result_d = trade_sell(result_c, circle.d_symbol.bid) // ETHBTC

      let result = result_d / (1 + this.fee * 4)

      circle.result = result

      if (circle.result > 1) {
        console.log(`${circle.a_symbol.exchange}: ${circle.a_symbol.id}-${circle.b_symbol.id}-${circle.c_symbol.id}-${circle.d_symbol.id} :`, circle.result, Date.now())
        // this.add_signal(circle)
      }
    }
  }
  */
