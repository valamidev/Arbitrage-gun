"use strict"

const Emitter = require("./emitter/emitter")

const Channel = "OrderBookUpdate"

class Arbitrage {
  constructor(symbols) {
    // Name, Price, Quote, Asset
    this.symbols = symbols
    this.quotes = ["BTC", "ETH", "XRP", "BNB", "USDT"]
    this.combinations = []
    this.fee = 0.001
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
                combinations.push({ a_symbol, b_symbol, c_symbol })
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

      if (circle.a_symbol.ask == 0 || circle.b_symbol.bid == 0 || circle.c_symbol.ask == 0) {
        continue
      }

      let entry = 1

      let result_a = trade_buy(entry, circle.a_symbol.ask) // Entry / a price

      let result_b = trade_buy(result_a, circle.b_symbol.bid) // result a / b price

      let result_c = trade_sell(result_b, circle.c_symbol.ask) // result b * price

      let result = result_c / (1 + this.fee * 3)

      circle.result = result

      if (circle.result > 1) {
        console.log(`${circle.a_symbol.exchange}: ${circle.a_symbol.name}-${circle.b_symbol.name}-${circle.c_symbol.name} :`, circle.result)
      }
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
