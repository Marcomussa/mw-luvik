const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get("/list", customerController.listUsers)

router.get("/list/:id", customerController.listUserByID)

router.post("/delete/:id", customerController.deleteUser)   

module.exports = router;