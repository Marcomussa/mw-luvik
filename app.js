require('dotenv').config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const productRoutes = require('./routes/products');
const userRoutes = require("./routes/users")
const PORT = 3000

app.use(bodyParser.json())
app.use('/products', productRoutes);
app.use("/users", userRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})