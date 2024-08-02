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
  if (!receivedSignature) {
    return res.status(400).send('No se encontró la firma en los encabezados');
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
  const generatedSignature = crypto
      .createHmac('sha256', SHOPIFY_SECRET)
      .update(rawBody)
      .digest('base64');

  console.log('Firma generada:', generatedSignature);
  console.log('Firma recibida:', receivedSignature);

  const bufferReceivedSignature = Buffer.from(receivedSignature, 'base64');
  const bufferGeneratedSignature = Buffer.from(generatedSignature, 'base64');

  if (crypto.timingSafeEqual(bufferReceivedSignature, bufferGeneratedSignature)) {
    console.log('Firma válida');
    next();
  } else {
    console.log('Firma inválida');
    res.status(401).send('Firma no válida');
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