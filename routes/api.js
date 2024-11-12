const express = require("express");
const router = express.Router();
const Log = require('../models/LogErrorProduct'); // Importa el modelo Log

router.get('/update-error-logs', async (req, res) => {
    try {
        const logs = await Log.find();
        const sanitizedLogs = logs.map(log => {
            const logObject = log.toObject();
            logObject.productId = Number(logObject.productId)
            delete logObject._id;
            delete logObject.__v;
            delete logObject.additionalInfo;
            return logObject;
        });

        res.status(200).json(sanitizedLogs);
    } catch (err) {
        console.error('Error leyendo logs de MongoDB:', err);
        res.status(500).json({ message: 'Error al leer los logs de la base de datos.' });
    }
});

//! NO ESTA EN USO. PASA TODA LA INFO DIRECTAMENTE X EL MODEL
// Ruta para capturar y guardar errores: /update-error-logs. 
router.post('/update-error-logs', async (req, res) => {
  const errorData = req.body;
  console.log('Error recibido:', errorData);

  const log = new Log({
    productId: errorData.productId,
    message: errorData.message,
    additionalInfo: errorData.additionalInfo,
  });

  try {
    await log.save();
    res.status(200).json({ message: 'Error recibido y guardado correctamente.' });
  } catch (err) {
    console.error('Error guardando en MongoDB:', err);
    res.status(500).json({ message: 'Error al guardar el log en la base de datos.' });
  }
});

module.exports = router;
