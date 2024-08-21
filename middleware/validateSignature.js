require('dotenv').config()
const crypto = require('crypto')
const SHOPIFY_SECRET = process.env.WEBHOOK_SECRET

const validateSignature = (req, res, next) => {
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

    next()
}

module.exports = validateSignature;
