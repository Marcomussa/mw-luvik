require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const SHOPIFY_SECRET = "6b62086837a63bb49b3e44e45b7eac4aa1db77e9be0e88c7f6f7a03632b88412"

// Middleware para parsear el cuerpo de la solicitud y almacenar el cuerpo sin procesar
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const verifyShopifyWebhook = (req, res, next) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const body = req.rawBody;
  const hash = crypto.createHmac('sha256', SHOPIFY_SECRET)
                     .update(body, 'utf8', 'hex')
                     .digest('base64')

  if (hash === hmacHeader) {
    next();
  } else {
    res.status(401).send('Webhook verification failed')
  }
}

router.post('/new', verifyShopifyWebhook, (req, res) => {
  const orderData = req.body

  console.log('Nueva orden recibida:', orderData)

  // Logica

  res.status(200).send('Webhook recibido correctamente')
})

module.exports = router