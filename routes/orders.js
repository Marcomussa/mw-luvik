require('dotenv').config()
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')

router.post('/new', (req, res) => {
    try {
        const order = req.body
        console.log('Orden creada: ', order)
    
        res.status(200).send('Webhook recibido exitosamente')
      } catch (error) {
        console.error('Error procesando el webhook: ', error)
        res.status(401).send('Webhook verification failed x')
      }
})

module.exports = router