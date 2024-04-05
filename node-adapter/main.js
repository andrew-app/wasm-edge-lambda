const fs = require('node:fs');

const buffer = fs.readFileSync('../go-edge-lambda/main.wasm');

WebAssembly.instantiate(buffer, {})
.then(result => {
    console.log(result)
  })
  .catch(console.error);