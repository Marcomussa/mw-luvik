require('dotenv').config()
const express = require('express')
const axios = require('axios')
const router = express.Router()

router.post('/new', async (req, res) => {
  const data = JSON.parse(req.body);
  console.log('Webhook recibido:', data);

  const response = await axios.post("http://informes.luvik.com.ar/shopify.php", data)

  return response
})

module.exports = router