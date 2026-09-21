import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePostTitle,
  deletePost,
  votePost,
} from '../controllers/postsController.js';
import {
  getCommentsForPost,
  createComment,
  voteComment,
} from '../controllers/commentsController.js';

const router = Router();

// Posts
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', createPost);
router.patch('/posts/:id', updatePostTitle);
router.delete('/posts/:id', deletePost);
router.post('/posts/:id/vote', votePost);

// Comments
router.get('/posts/:postId/comments', getCommentsForPost);
router.post('/posts/:postId/comments', createComment);
router.post('/comments/:id/vote', voteComment);

export default router;
