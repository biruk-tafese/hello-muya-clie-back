// controllers/conversationController.js

const Conversation = require('../models/chat/conversationsModel');
const Message = require('../models/chat/messageModel');

exports.startConversation = async (req, res) => {
  const { adminId, userId } = req.params;
  try {
    const conversation = await Conversation.create({
      participants: [adminId, userId],
      messages: []
    });
    await Admin.findByIdAndUpdate(adminId, { $push: { conversations: conversation._id } });
    res.status(201).json({ message: 'Conversation started successfully', conversation });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Failed to start conversation' });
  }
};

exports.addMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { sender, content } = req.body;
  try {
    const message = await Message.create({ sender, content });
    await Conversation.findByIdAndUpdate(conversationId, { $push: { messages: message._id } });
    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getAdminConversations = async (req, res) => {
  const { adminId } = req.params;
  try {
    const adminConversations = await Conversation.find({ participants: adminId }).populate('messages');
    res.json({ conversations: adminConversations });
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

exports.getSingleConversation = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId).populate('messages');
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
};