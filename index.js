"use strict"

const Emitter = require("./emitter/emitter")

const Channel = "OrderBookUpdate"

class Arbitrage {
  constructor(symbols) {
    // Name, Price, Quote, Asset
    this.symbols = symbols
    this.quotes = ["BTC", "ETH", "XRP", "BNB", "USDT"]
    this.combinations = []
    this.signals = new Map()
    this.fee = 0.00075
    this.min_profit = 1.001
    this.singal_timeout = 60000 // 1 min
  }

  start() {
    Emitter.on(Channel, (msg) => {
      let update = 0

      for (let i = 0; i < this.symbols.length; i++) {
        const symbol = this.symbols[i]

        if (symbol.name == msg.symbol && symbol.exchange == msg.exchange) {
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

      let entry = 1

      let result_a = trade_buy(entry, (circle.a_symbol.ask + circle.a_symbol.bid) / 2) // Entry / a price

      let result_b = trade_buy(result_a, (circle.b_symbol.ask + circle.b_symbol.bid) / 2) // result a / b price

      let result_c = trade_sell(result_b, (circle.c_symbol.ask + circle.c_symbol.bid) / 2) // result b * price

      let result = result_c / (1 + this.fee * 3)

      circle.result = result

      if (circle.result > 1) {
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
      Emitter.emit("NewArbitrageSignal", circle)
      console.log(`${circle.a_symbol.exchange}: ${circle.a_symbol.name}-${circle.b_symbol.name}-${circle.c_symbol.name} :`, circle.result, time)
      console.log(`${circle.a_symbol.ask}: ${circle.b_symbol.bid}-${circle.c_symbol.ask}`)
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
        console.log(`${circle.a_symbol.exchange}: ${circle.a_symbol.name}-${circle.b_symbol.name}-${circle.c_symbol.name}-${circle.d_symbol.name} :`, circle.result, Date.now())
        // this.add_signal(circle)
      }
    }
  }
  */
