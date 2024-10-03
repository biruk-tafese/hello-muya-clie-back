// routes/chat.js

const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/chatControllers');

// Route to start a new conversation
router.post('/admin/:adminId/user/:userId', conversationController.startConversation);

// Route to add a message to a conversation
router.post('/conversation/:conversationId/message', conversationController.addMessage);

// Route to fetch all conversations of a specific admin
router.get('/admin/:adminId/conversations', conversationController.getAdminConversations);

router.get('/conversation/:conversationId', conversationController.getSingleConversation);


module.exports = router;
