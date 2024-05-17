const express = require("express")
const axios = require("axios")
const bodyParser = require("body-parser")
const app = express()
const PORT = 3000

// Configuración del ERP
const ERP_API_URL = ""
const ERP_API_KEY = ""

// Configuración de Shopify
const SHOPIFY_STORE_URL = ""
const SHOPIFY_API_KEY = ""
const SHOPIFY_API_PASSWORD = ""

app.use(bodyParser.json())

// Endpoint para obtener inventario desde el ERP
app.get('/inventory', async (req, res) => {
    try {
        const productId = req.query.product_id
        const response = await axios.get(`${ERP_API_URL}?product_id=${productId}`, {
            headers: { 'Authorization': `Bearer ${ERP_API_KEY}` }
        })
        res.json(response.data)
    } catch (error) {
        res.status(500).send(`Error Obteniendo Productos del ERP. Codigo de Error: ${error}`)
    }
})

// Endpoint para actualizar inventario en Shopify
app.post('/update_inventory', async (req, res) => {
    try {
        const products = req.body.products // Lista de productos a actualizar

        for (const product of products) {
            const { id, inventory_quantity } = product
            await axios.put(`${SHOPIFY_STORE_URL}/admin/api/2021-07/products/${id}.json`, {
                product: {
                    id,
                    variants: [
                        {
                            inventory_quantity
                        }
                    ]
                }
            }, {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_API_PASSWORD
                }
            })
        }
        res.status(200).send('Inventario Actualizado Exitosamente')
    } catch (error) {
        res.status(500).send(`Error Actualizando Error. Erros Logs: ${error}`)
    }
})

app.listen(PORT, () => {
    console.log(`Server Online on Port ${PORT}`)
})