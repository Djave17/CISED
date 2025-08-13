// api/routes/evaluation.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/evaluation.controller');
router.post('/:formType', ctrl.create);
router.get('/', ctrl.list);
module.exports = router;
