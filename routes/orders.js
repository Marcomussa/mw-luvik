require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const getRawBody = require('raw-body')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

app.use(bodyParser.json({
   verify: (req, res, buf) => {
    req.rawBody = buf
   }
}))

const verifyShopifyWebhook = (req, res, next) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const body = req.rawBody

  const hash = crypto.createHmac('sha256', SHOPIFY_SECRET).update(body, 'utf8', 'hex').digest('base64')
  if (hash === hmacHeader) {
    next()
  } else {
    res.status(401).send('Webhook verification failed')
  }
}

router.post('/new', async (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256')
  const body = req.rawBody
  console.log(body)
  const hash = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET_KEY).update(body, 'utf8', 'hex').digest('base64')

  if (hash === hmac) {
    console.log('Nueva orden recibida:', body)
    res.sendStatus(200)
  } else {
    console.log('error')
    res.sendStatus(403)
  }
  //! Logic

  res.status(200).send('Webhook recibido correctamente')
})

router.post('/new-test', (req, res) => {
  const orderData = req.body
  console.log('Nueva orden recibida:', orderData)

  //! Logic

  res.status(200).send('Webhook recibido correctamente')
})

module.exports = router