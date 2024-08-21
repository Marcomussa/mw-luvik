require('dotenv').config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const auth = require('./middleware/auth')
const PORT = process.env.PORT
const crypto = require('crypto')
const productRoutes = require('./routes/products')
const userRoutes = require("./routes/customers")
const orderRoutes = require('./routes/orders')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

//! Webhook Validation. SI se modulariza no funciona. NI IDEA POR QUE
function validateSignature(req, res, next) {
    const receivedSignature = req.headers['x-shopify-hmac-sha256'];
    if (!receivedSignature) {
        return res.status(400).send('No se encontró la firma en los encabezados');
    }
  
    try {
        const rawBody = req.body;
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
    } catch (error) {
        console.error('Error al validar la firma:', error);
        res.status(500).send('Error interno del servidor');
    }
}
app.use('/products', bodyParser.json({limit: '50mb', type: 'application/json'}), auth, productRoutes)

app.use("/customers", bodyParser.json({limit: '50mb', type: 'application/json'}), auth, userRoutes)

app.use("/customer/new", express.raw({ type: 'application/json' }), validateSignature, (req, res) => {
    const data = JSON.parse(req.body);
    console.log('Webhook recibido:', data);
    //! Logic
    res.status(200).send('Webhook de USUARIO recibido correctamente')
})

app.use("/orders", express.raw({ type: 'application/json' }), validateSignature, orderRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})