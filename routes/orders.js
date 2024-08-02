require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

app.use(bodyParser.raw({ type: 'application/json' }));

function validateSignature(req, res, next) {
  const receivedSignature = req.headers['x-shopify-hmac-sha256'];
  const generatedSignature = crypto
      .createHmac('sha256', SHOPIFY_SECRET)
      .update(req.body, "utf8", "hex")
      .digest('base64');

  console.log(generatedSignature)
  console.log(receivedSignature)

  if (generatedSignature === receivedSignature) {
      console.log("Firma valida")
      next(); // La firma es válida
  } else {
      console.log("Firma invalida")
      res.status(401);
  }
}

router.post('/new', validateSignature,(req, res) => {
  const data = JSON.parse(req.body);
  console.log('Webhook recibido:', data);
  res.status(200).send('Webhook recibido correctamente')
})

router.post('/new-test', (req, res) => {
  const orderData = req.body
  console.log('Nueva orden recibida:', orderData)

  //! Logic

  res.status(200).send('Webhook recibido correctamente')
})

module.exports = router