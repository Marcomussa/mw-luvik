const shopifyClient = require('../clients/shopifyClient')

exports.listUsers = async (req, res) => {
    try {
      const response = await shopifyClient.listUsers()
      res.status(200).json(response)
    } catch (error) {
      res.status(500).json({ error: error.message })
      console.log('Error Obteniendo Usuarios. customerController.js', error.message)
    }
}

exports.listUserByID = async (req, res) => {
  try {
    const userId = req.params.id
    const response = await shopifyClient.listUserByID(userId)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Obteniendo Usurario de ID: ${req.params.id}. customerController.js`, error.message)
    res.status(500).json({ error: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id
    const response = await shopifyClient.deleteUser(userId)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Eliminando Usurario de ID: ${req.params.id}. customerController.js`, error.message)
    res.status(500).json({ error: error.message })
  }
}

//todo: Update User Data & Metafields