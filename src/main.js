"use strict"

const config = require("../arbitrage_config.json")
require("./redis")

// Start the application

const ArbitrageAPI = require("./arbitrage")
const TraderClass = require("./trader")

const Arbitrage = new ArbitrageAPI({
  symbols: config.symbols,
  quotes: config.quotes,
  fee: config.fee,
  min_signal_profit: config.min_signal_profit,
  singal_timeout: config.singal_timeout,
  debug: config.debug
}).start()

const Trader = new TraderClass(config.balances, config.quote_limits).start()

//console.log(Arbitrage.combinations)
