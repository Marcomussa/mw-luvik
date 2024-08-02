require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

app.use('/new', bodyParser.raw({ type: 'application/json' }));

router.post('/new', async (req, res) => {
  const body = req.body
  const hmac = req.headers["x-shopify-hmac-sha256"];
    
  const genHash = crypto
  .createHmac("sha256", process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(req.body), "utf8", "hex")
  .digest("base64");

  if (genHash !== hmac) {
    return res.status(401).send("Couldn't verify incoming Webhook request!");
  }
  
  //! Logic
  console.log(body)
  res.status(200).send('Webhook recibido correctamente')
})

router.post('/new-test', (req, res) => {
  const orderData = req.body
  console.log('Nueva orden recibida:', orderData)

  //! Logic

  res.status(200).send('Webhook recibido correctamente')
})

module.exports = router