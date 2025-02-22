import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import {
  getMessages,
  sendMessage,
  getConversations,
  sendMobileMessage,
} from '../controllers/messageController.js';

const router = express.Router();

// METHODS
router.get('/conversations', protectRoute, getConversations);
router.get('/:otherUserId', protectRoute, getMessages);

router.post('/', protectRoute, sendMessage);
router.post('/mobile', protectRoute, sendMobileMessage);

export default router;
