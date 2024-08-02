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

app.use(bodyParser.json())
app.use('/products', bodyParser.json(), auth, productRoutes)
app.use("/customers", bodyParser.json(), auth, userRoutes)
app.use("/orders", bodyParser.raw({ type: 'application/json' }), orderRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})