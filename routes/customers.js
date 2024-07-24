const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get("/list", customerController.listUsers)

router.get('/get-id-by-name/:name', customerController.getUserIDByName)

router.get("/list/:id", customerController.getUserByID)

router.post("/delete/:id", customerController.deleteUser)   

router.post('/update/:id', customerController.updateUser)

module.exports = router;