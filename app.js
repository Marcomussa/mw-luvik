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
app.use('/orders/new', bodyParser.raw({ type: 'application/json' }), async (req, res, next) => {
    const hmac = req.headers["x-shopify-hmac-sha256"];
    
    const genHash = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(req.body, "utf8", "hex")
    .digest("base64");
    
    console.log(hmac);
    console.log(genHash);
    
    if (genHash !== hmac) {
    return res.status(401).send("Couldn't verify incoming Webhook request!");
    }
    
    req.body = JSON.parse(req.body);
    
    next();
});
app.use('/products', auth, productRoutes)
app.use("/customers", auth, userRoutes)
app.use("/orders", orderRoutes)

//* SERVER *//
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})