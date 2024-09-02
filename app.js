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
const axios = require('axios')
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

app.use("/customer/new", express.raw({ type: 'application/json' }), validateSignature, async (req, res) => {
    try {
        const data = JSON.parse(req.body);
        console.log('Webhook recibido:', data);

        delete data.tax_exemptions
        delete data.email_marketing_consent
        delete data.sms_marketing_consent
        delete data.multipass_identifier

        const note = data.note
        const lines = note.split('\n');
        const extractedData = {};

        lines.forEach(line => {
            const trimmedLine = line.trim(); 
            if (trimmedLine && trimmedLine.includes(':')) { 
                const [key, value] = trimmedLine.split(/:(.+)/); 
                extractedData[key.trim()] = value.trim(); 
            }
        });

        data.note = extractedData

        await axios.post("http://informes.luvik.com.ar/shopify.php", data)

        res.status(200).json({ message: 'Webhook procesado correctamente' });

    } catch (error) {
        console.error('Error procesando el webhook:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.use("/orders", express.raw({ type: 'application/json' }), validateSignature, orderRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})