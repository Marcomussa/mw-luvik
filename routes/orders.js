require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

router.post('/new', async (req, res) => {
  const body = req.body
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