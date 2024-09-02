require('dotenv').config()
const express = require('express')
const axios = require('axios')
const router = express.Router()

router.post('/new', async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    console.log('Webhook recibido:', data);

    await axios.post("http://informes.luvik.com.ar/shopify.php", data);

    res.status(200).json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    console.error('Error procesando el webhook:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router