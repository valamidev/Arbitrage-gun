"use strict"

require("dotenv").config()

const ARBITRAGEAPI = require("./index")

require("./redis")

// Name, Price, Quote, Asset
let symbols = [
  { name: "ADABNB", ask: 0, bid: 0, quote: "BNB", asset: "ADA" },
  { name: "ADABTC", ask: 0, bid: 0, quote: "BTC", asset: "ADA" },
  { name: "ADAETH", ask: 0, bid: 0, quote: "ETH", asset: "ADA" },
  { name: "AGIBTC", ask: 0, bid: 0, quote: "BTC", asset: "AGI" },
  { name: "AIONBTC", ask: 0, bid: 0, quote: "BTC", asset: "AION" },
  { name: "ALGOBNB", ask: 0, bid: 0, quote: "BNB", asset: "ALGO" },
  { name: "ALGOBTC", ask: 0, bid: 0, quote: "BTC", asset: "ALGO" },
  { name: "ANKRBTC", ask: 0, bid: 0, quote: "BTC", asset: "ANKR" },
  { name: "ARKBTC", ask: 0, bid: 0, quote: "BTC", asset: "ARK" },
  { name: "ATOMBTC", ask: 0, bid: 0, quote: "BTC", asset: "ATOM" },
  { name: "BATBTC", ask: 0, bid: 0, quote: "BTC", asset: "BAT" },
  { name: "BCHABCBTC", ask: 0, bid: 0, quote: "BTC", asset: "BCHABC" },
  { name: "BCHABCUSDT", ask: 0, bid: 0, quote: "USDT", asset: "BCHABC" },
  { name: "BNBBTC", ask: 0, bid: 0, quote: "BTC", asset: "BNB" },
  { name: "BNBETH", ask: 0, bid: 0, quote: "ETH", asset: "BNB" },
  { name: "BNBUSDT", ask: 0, bid: 0, quote: "USDT", asset: "BNB" },
  { name: "BRDBNB", ask: 0, bid: 0, quote: "BNB", asset: "BRD" },
  { name: "BTCUSDT", ask: 0, bid: 0, quote: "USDT", asset: "BTC" },
  { name: "BTGBTC", ask: 0, bid: 0, quote: "BTC", asset: "BTG" },

  { name: "CELRBTC", ask: 0, bid: 0, quote: "BTC", asset: "CELR" },
  { name: "DASHBTC", ask: 0, bid: 0, quote: "BTC", asset: "DASH" },
  { name: "DENTBTC", ask: 0, bid: 0, quote: "BTC", asset: "DENT" },
  { name: "DLTBTC", ask: 0, bid: 0, quote: "BTC", asset: "DLT" },
  { name: "DUSKBTC", ask: 0, bid: 0, quote: "BTC", asset: "DUSK" },
  { name: "ELFBTC", ask: 0, bid: 0, quote: "BTC", asset: "ELF" },
  { name: "ENJBTC", ask: 0, bid: 0, quote: "BTC", asset: "ENJ" },
  { name: "EOSBNB", ask: 0, bid: 0, quote: "BNB", asset: "EOS" },
  { name: "EOSBTC", ask: 0, bid: 0, quote: "BTC", asset: "EOS" },
  { name: "EOSETH", ask: 0, bid: 0, quote: "ETH", asset: "EOS" },
  { name: "EOSUSDT", ask: 0, bid: 0, quote: "USDT", asset: "EOS" },
  { name: "ERDBNB", ask: 0, bid: 0, quote: "BNB", asset: "ERD" },
  { name: "ERDBTC", ask: 0, bid: 0, quote: "BTC", asset: "ERD" },
  { name: "ETCBTC", ask: 0, bid: 0, quote: "BTC", asset: "ETC" },
  { name: "ETHBTC", ask: 0, bid: 0, quote: "BTC", asset: "ETH" },
  { name: "ETHUSDT", ask: 0, bid: 0, quote: "USDT", asset: "ETH" },
  { name: "EVXBTC", ask: 0, bid: 0, quote: "BTC", asset: "EVX" },
  { name: "FETBNB", ask: 0, bid: 0, quote: "BNB", asset: "FET" },
  { name: "FETBTC", ask: 0, bid: 0, quote: "BTC", asset: "FET" },
  { name: "FTMBTC", ask: 0, bid: 0, quote: "BTC", asset: "FTM" },
  { name: "FUNBTC", ask: 0, bid: 0, quote: "BTC", asset: "FUN" },

  { name: "ICXBTC", ask: 0, bid: 0, quote: "BTC", asset: "ICX" },
  { name: "IOTABTC", ask: 0, bid: 0, quote: "BTC", asset: "IOTA" },
  { name: "KMDBTC", ask: 0, bid: 0, quote: "BTC", asset: "KMD" },
  { name: "KNCBTC", ask: 0, bid: 0, quote: "BTC", asset: "KNC" },
  { name: "KNCETH", ask: 0, bid: 0, quote: "ETH", asset: "KNC" },
  { name: "LINKBTC", ask: 0, bid: 0, quote: "BTC", asset: "LINK" },
  { name: "LINKETH", ask: 0, bid: 0, quote: "ETH", asset: "LINK" },
  { name: "LINKUSDT", ask: 0, bid: 0, quote: "USDT", asset: "LINK" },
  { name: "LRCBTC", ask: 0, bid: 0, quote: "BTC", asset: "LRC" },
  { name: "LRCETH", ask: 0, bid: 0, quote: "ETH", asset: "LRC" },
  { name: "LTCBNB", ask: 0, bid: 0, quote: "BNB", asset: "LTC" },
  { name: "LTCBTC", ask: 0, bid: 0, quote: "BTC", asset: "LTC" },
  { name: "LTCETH", ask: 0, bid: 0, quote: "ETH", asset: "LTC" },
  { name: "LTCUSDT", ask: 0, bid: 0, quote: "USDT", asset: "LTC" },
  { name: "MANABTC", ask: 0, bid: 0, quote: "BTC", asset: "MANA" },
  { name: "MATICBTC", ask: 0, bid: 0, quote: "BTC", asset: "MATIC" },
  { name: "MDABTC", ask: 0, bid: 0, quote: "BTC", asset: "MDA" },
  { name: "MTLBTC", ask: 0, bid: 0, quote: "BTC", asset: "MTL" },
  { name: "NANOBTC", ask: 0, bid: 0, quote: "BTC", asset: "NANO" },
  { name: "NEOBNB", ask: 0, bid: 0, quote: "BNB", asset: "NEO" },
  { name: "NEOBTC", ask: 0, bid: 0, quote: "BTC", asset: "NEO" },
  { name: "NEOETH", ask: 0, bid: 0, quote: "ETH", asset: "NEO" },
  { name: "NEOUSDT", ask: 0, bid: 0, quote: "USDT", asset: "NEO" },
  { name: "NPXSBTC", ask: 0, bid: 0, quote: "BTC", asset: "NPXS" },
  { name: "NPXSETH", ask: 0, bid: 0, quote: "ETH", asset: "NPXS" },
  { name: "OAXBTC", ask: 0, bid: 0, quote: "BTC", asset: "OAX" },
  { name: "ONEBNB", ask: 0, bid: 0, quote: "BNB", asset: "ONE" },
  { name: "ONEBTC", ask: 0, bid: 0, quote: "BTC", asset: "ONE" },
  { name: "ONTBTC", ask: 0, bid: 0, quote: "BTC", asset: "ONT" },
  { name: "PAXUSDT", ask: 0, bid: 0, quote: "USDT", asset: "PAX" },
  { name: "RENBNB", ask: 0, bid: 0, quote: "BNB", asset: "REN" },
  { name: "RENBTC", ask: 0, bid: 0, quote: "BTC", asset: "REN" },
  { name: "RVNBTC", ask: 0, bid: 0, quote: "BTC", asset: "RVN" },
  { name: "STORJBTC", ask: 0, bid: 0, quote: "BTC", asset: "STORJ" },
  { name: "THETABTC", ask: 0, bid: 0, quote: "BTC", asset: "THETA" },
  { name: "TRXBNB", ask: 0, bid: 0, quote: "BNB", asset: "TRX" },
  { name: "TRXBTC", ask: 0, bid: 0, quote: "BTC", asset: "TRX" },
  { name: "TRXETH", ask: 0, bid: 0, quote: "ETH", asset: "TRX" },
  { name: "TRXUSDT", ask: 0, bid: 0, quote: "USDT", asset: "TRX" },
  { name: "USDCUSDT", ask: 0, bid: 0, quote: "USDT", asset: "USDC" },
  { name: "VETBTC", ask: 0, bid: 0, quote: "BTC", asset: "VET" },
  { name: "WAVESBTC", ask: 0, bid: 0, quote: "BTC", asset: "WAVES" },
  { name: "WAVESETH", ask: 0, bid: 0, quote: "ETH", asset: "WAVES" },
  { name: "WTCBTC", ask: 0, bid: 0, quote: "BTC", asset: "WTC" },
  { name: "XLMBTC", ask: 0, bid: 0, quote: "BTC", asset: "XLM" },
  { name: "XMRBTC", ask: 0, bid: 0, quote: "BTC", asset: "XMR" },
  { name: "XRPBNB", ask: 0, bid: 0, quote: "BNB", asset: "XRP" },
  { name: "XRPBTC", ask: 0, bid: 0, quote: "BTC", asset: "XRP" },
  { name: "XRPETH", ask: 0, bid: 0, quote: "ETH", asset: "XRP" },
  { name: "XRPUSDT", ask: 0, bid: 0, quote: "USDT", asset: "XRP" },
  { name: "ZECBTC", ask: 0, bid: 0, quote: "BTC", asset: "ZEC" }
]

const Arbitrage = new ARBITRAGEAPI(symbols)

Arbitrage.start()

console.time("Arbitrage calc loop")

for (let i = 0; i < 100; i++) {
  Arbitrage.create_combinations()

  Arbitrage.evaluate_combinations()
}

console.timeEnd("Arbitrage calc loop")

console.log(Arbitrage.combinations)
