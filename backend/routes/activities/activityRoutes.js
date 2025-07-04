const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../auth/authMiddleware');
const getRecentActivitiesController = require('../../controllers/activities/getRecentActivitiesController');

router.use(requireAuth);
router.get('/recent', getRecentActivitiesController);

module.exports = router; 