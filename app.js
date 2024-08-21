require('dotenv').config()
const express = require("express")
const app = express()
const PORT = process.env.PORT

const bodyParser = require("body-parser")
const validateSignature = require("./middleware/validateSignature")
const auth = require('./middleware/auth')

const productRoutes = require('./routes/products')
const userRoutes = require("./routes/customers")
const orderRoutes = require('./routes/orders')

app.use('/products', 
    bodyParser.json({
        limit: '50mb', 
        type: 'application/json'
    }), 
    auth, 
    productRoutes)

app.use("/customers", 
    bodyParser.json({
        limit: '50mb', 
        type: 'application/json'
    }), 
    auth, 
    userRoutes)

app.use("/orders", 
    express.raw({ 
        type: 'application/json' 
    }), 
    validateSignature, 
    orderRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})