require('dotenv').config()
require('./logger');

const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const auth = require('./middleware/auth')
const cron = require('node-cron');
const PORT = process.env.PORT
const crypto = require('crypto')
const productRoutes = require('./routes/products')
const userRoutes = require("./routes/customers")
const orderRoutes = require('./routes/orders')
const APIRoutes = require('./routes/api')
const axios = require('axios')
const mongoose = require("mongoose")
const Log = require('./models/LogErrorProduct'); 
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

//! DB Externa para reducir rate-limit de validaciones de productos
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión exitosa a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};
connectToDatabase()

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
app.use('/products', bodyParser.json({ limit: '50mb', type: 'application/json' }), auth, productRoutes)

app.use("/customers", bodyParser.json({ limit: '50mb', type: 'application/json' }), auth, userRoutes)

app.use("/customer/new", express.raw({ type: 'application/json' }), validateSignature, async (req, res) => {
    try {
        const data = JSON.parse(req.body);
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

        console.log('Webhook recibido:', data);

        await axios.post("http://informes.luvik.com.ar/shopify_cliente.php", data)

        res.status(200).json({ message: 'Webhook procesado correctamente' });

    } catch (error) {
        console.error('Error procesando el webhook:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.use("/product/delete", express.raw({ type: 'application/json' }), validateSignature, async (req, res) => {
    try {
        const data = JSON.parse(req.body);

        console.log('Webhook recibido:', data);

        res.status(200).json({ message: 'Webhook procesado correctamente' });

    } catch (error) {
        console.error('Error procesando el webhook:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.use("/orders", express.raw({ type: 'application/json' }), validateSignature, orderRoutes)

app.use('/api', express.raw({ type: 'application/json' }), APIRoutes)

// cron.schedule('0 0 */2 * *', async () => {
//     try {
//         console.log('Ejecutando limpieza de la base de datos...');
//         await Log.deleteMany({}); 
  
//         console.log('Limpieza de la base de datos completada.');
//     } catch (err) {
//         console.error('Error al limpiar la base de datos:', err);
//     }
//   });


//   (async () => {
//     try {
//         console.log('Ejecutando limpieza de la base de datos... (ejecución inmediata)');
//         await Log.deleteMany({});
//         console.log('Limpieza de la base de datos completada.');
//     } catch (err) {
//         console.error('Error al limpiar la base de datos (ejecución inmediata):', err);
//     }
// })();

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})