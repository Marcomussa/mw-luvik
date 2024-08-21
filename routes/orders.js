require('dotenv').config()
const express = require('express')
const router = express.Router()

router.post('/new', (req, res) => {
  const data = JSON.parse(req.body);
  console.log('Webhook recibido:', data);

  //! Logic

  res.status(200).send('Webhook de ORDEN recibido correctamente')
})

module.exports = router