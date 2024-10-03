const express = require('express');
const requestController = require('../controllers/serviceRequestControllers');
const router = express.Router();
const authorize = require("../middlewares/adminAuthorization");

router.post("/newRequest",authorize('admin'),requestController.createRequest)
router.get('/getAllRequest', authorize('admin'), requestController.getAllServiceRequests);
router.patch('/:id/status', authorize('admin'), requestController.updateServiceRequestStatus);
router.patch('/:id/note', authorize('admin'), requestController.addNoteToServiceRequest);
router.delete('/:id', authorize('admin'), requestController.deleteServiceRequest);
router.get('/search', authorize('admin'), requestController.searchServiceRequest);
router.get('/servicesPerMonth', authorize('admin'), requestController.getDataByMonth);
router.get('/getRecentRequest', authorize('admin'), requestController.getRecentService);
// router.get('/', authorize('admin'), requestController.getAllServiceRequests);
// router.get('/', authorize('admin'), requestController.getAllServiceRequests);
// router.get('/', authorize('admin'), requestController.getAllServiceRequests);

module.exports = router;
