require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

function verifyShopifyWebhook(req, res, buf) {
  const secret = process.env.WEBHOOK_SECRET
  console.log(secret)
  const hmac = req.get('X-Shopify-Hmac-Sha256')
  const generatedHmac = crypto
    .createHmac('sha256', secret)
    .update(buf, 'utf8', 'hex')
    .digest('base64')

  if (generatedHmac !== hmac) {
    throw new Error('Webhook verification failed')
  }
}

router.post('/new', (req, res) => {
    try {
        verifyShopifyWebhook(req, res, req.rawBody)
    
        const order = req.body
        console.log('Orden creada: ', order)
    
        res.status(200).send('Webhook recibido exitosamente')
      } catch (error) {
        console.error('Error procesando el webhook: ', error)
        res.status(401).send('Webhook verification failed')
      }
})

module.exports = router