"use strict"

const trade_buy = (balance, price) => {
  return balance / price
}

const trade_sell = (balance, price) => {
  return balance * price
}

const arbitrage_symbol = (symbol, quotes) => {
  return Boolean(quotes.indexOf(symbol.quote) != -1 && quotes.indexOf(symbol.asset) != -1)
}

class Arbitrage {
  constructor(symbols) {
    // Name, Price, Quote, Asset
    this.symbols = symbols
    this.quotes = ["BTC", "ETH", "BNB", "USDT"]
    this.combinations = []
    this.fee = 0.0015
  }

  create_combinations() {
    let combinations = []
    for (let i = 0; i < this.symbols.length; i++) {
      let a_symbol = this.symbols[i]
      if (arbitrage_symbol(a_symbol, this.quotes)) {
        for (let j = 0; j < this.symbols.length; j++) {
          let b_symbol = this.symbols[j]
          if (b_symbol.quote == a_symbol.asset) {
            for (let k = 0; k < this.symbols.length; k++) {
              let c_symbol = this.symbols[k]

              if (c_symbol.quote == a_symbol.quote && c_symbol.asset == b_symbol.asset) {
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

      let entry = 1

      let result_a = trade_buy(entry, circle.a_symbol.price) // Entry / a price

      let result_b = trade_buy(result_a, circle.b_symbol.price) // result a / b price

      let result_c = trade_sell(result_b, circle.c_symbol.price) // result b * price

      let result = result_c / (1 + this.fee * 3)

      circle.result = result
    }
  }
}

module.exports = Arbitrage
