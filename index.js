var Web3 = require("web3"),
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:" +
                                                    (process.env.RPC_PORT || 8545))),
    _ = require("lodash"),
    async = require("async")


const RETRY_TIMEOUT_SECONDS = 2 //seconds

var scanBlocks = (cb) => {
  var curBlockN = web3.eth.getBlock("latest").number,
      startBlockN = curBlockN - process.env.NUMBER_BLOCKS_TO_SCAN
  
  console.log(`scan blocks from ${startBlockN} to ${curBlockN}`);

  async.some(_.range(startBlockN, curBlockN), (blockN, cb) => {
    web3.eth.getBlock(blockN, (err, block) => {
      cb(err, block.author === process.env.SIGNER_ADDRESS)
    })
  }, cb)
}


var startSigning = (cb) => {
  console.log("Start signing");

  web3.currentProvider.sendAsync({
    jsonrpc: "2.0",
    method: "parity_setEngineSigner",
    params: [ process.env.SIGNER_ADDRESS, process.env.SIGNER_PASSWORD ],
    id: new Date().getTime()
  },cb)
}


var startScan = () => {
  if(!web3.isConnected()){
    console.log(`Not connected to the node, try again in ${RETRY_TIMEOUT_SECONDS} seconds`);
    setTimeout(startScan, RETRY_TIMEOUT_SECONDS * 1000)
  }else if(web3.eth.syncing) {
    console.log(`Node still syncing, check again in ${RETRY_TIMEOUT_SECONDS} seconds`);
    setTimeout(startScan, RETRY_TIMEOUT_SECONDS * 1000)
  } else { //all good, let's scan
    scanBlocks((err, found) => {
      if(err) throw err

      if(!found){
        console.log(`Failed to find a block authored by ${process.env.SIGNER_ADDRESS}`);
        startSigning((err, res) => {
          if(err) throw err

          if(res.error){
            console.error(res.error)
          }else{
            console.log(`Now signing with ${ process.env.SIGNER_ADDRESS }`);
          }
        })
      } else {
        console.log(`Found a block authored by ${ process.env.SIGNER_ADDRESS }, all good`);
      }

      setTimeout(startScan, process.env.SCAN_INTERVAL_SECONDS * 1000)
    })
  }
}

startScan()

