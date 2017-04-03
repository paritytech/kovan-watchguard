{
  "apps": [{
    "name": "kovan-watchguard",
    "script": "index.js",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "watch": true,
    "cwd": ".",
    "env": {
      "SIGNER_ADDRESS": "<address to scan for and sign with>",
      "SIGNER_PASSWORD": "<address to unlock the signer address>",
      "SCAN_INTERVAL_SECONDS": 1800,
      "NUMBER_BLOCKS_TO_SCAN": 100
    }
  }]
}
