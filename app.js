require('dotenv').config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const productRoutes = require('./routes/products')
const userRoutes = require("./routes/customers")
const auth = require('./middleware/auth')
const PORT = 3000

app.use(bodyParser.json())
app.use('/products', auth, productRoutes)
app.use("/customers", auth, userRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})