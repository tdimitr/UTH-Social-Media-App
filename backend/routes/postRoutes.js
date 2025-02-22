import express from 'express';
import {
  createPost,
  deletePost,
  getPost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  deleteReplyToPost,
  getUserReplies,
  createMobilePost,
} from '../controllers/postController.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// METHODS
router.get('/feed', protectRoute, getFeedPosts);
router.get('/:id', getPost);
router.get('/user/:username', getUserPosts);
router.get('/replies/:username', getUserReplies);

router.post('/create', protectRoute, createPost);
router.post('/mobile/create', protectRoute, createMobilePost);

router.delete('/delete/:id', protectRoute, deletePost);
router.delete('/:postId/reply/:replyId', protectRoute, deleteReplyToPost);

router.put('/like/:id', protectRoute, likeUnlikePost);
router.put('/reply/:id', protectRoute, replyToPost);

export default router;
