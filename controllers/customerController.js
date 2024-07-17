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

exports.getUserByID = async (req, res) => {
  try {
    const userId = req.params.id
    const response = await shopifyClient.listUserByID(userId)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Obteniendo Usuario de ID: ${req.params.id}. customerController.js`, error.message)
    res.status(500).json({ error: error.message })
  }
}

exports.getUserIDByName = async (req, res) => {
  const name = req.params.name
  try {
    const response = await shopifyClient.getUserIDByName(name)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Obteniendo Usuario: ${req.params.name}. customerController.js`, error.message)
    res.status(500).json({ error: error.message })
  }
}

exports.updateUser = async (req, res) => {
  const { data } = req.body
  const { id } = req.params
  console.log(data)
  try {
    const response = await shopifyClient.updateUser(id, data)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Actualizando Usuario: ${id}. customerController.js`, error.message)
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

//todo: Update User Data 