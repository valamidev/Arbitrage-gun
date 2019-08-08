"use strict"

function* tirangle_trader(circle) {
  yield

  console.log("Trade")

  yield

  console.log("Trade")

  yield

  console.log("Trade")
}

let triangle_execute = tirangle_trader("asdas")

triangle_execute.next()
triangle_execute.next()
triangle_execute.next()
