const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.post('/', pacienteController.registrar);
router.get('/listar',pacienteController.listar);
module.exports = router;
