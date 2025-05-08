import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireAuth } from '../middleware';
import { ContentVisibility } from '@shared/schema';

const router = Router();

// Schemas
const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  emotion: z.enum(['happy', 'sad', 'angry', 'anxious', 'excited', 'neutral', 'joy', 'sadness', 'anger', 'surprise']).optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(200),
});

// Helper to check if user can view post
const canUserViewPost = async (userId: number, postUserId: number, visibility: ContentVisibility) => {
  if (userId === postUserId) return true;
  
  if (visibility === 'public') return true;
  
  if (visibility === 'friends') {
    // Check if users are friends
    const areFriends = await storage.checkFriendship(userId, postUserId);
    return areFriends;
  }
  
  return false;
};

// Get community posts
router.get('/posts', requireAuth, async (req, res) => {
  try {
    const filter = (req.query.filter as string) || 'latest';
    const userId = req.isAuthenticated() ? req.user!.id : 0;
    
    const posts = await storage.getCommunityPosts(filter, userId);
    
    // Filter posts based on visibility
    const accessiblePosts = await Promise.all(
      posts.filter(async (post) => {
        if (!userId && post.visibility !== 'public') return false;
        return await canUserViewPost(userId, post.userId, post.visibility as ContentVisibility);
      })
    );
    
    res.status(200).json(accessiblePosts);
  } catch (error: any) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch community posts' });
  }
});

// Create a new post
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const data = createPostSchema.parse(req.body);
    
    const post = await storage.createCommunityPost({
      userId: req.user!.id,
      content: data.content,
      emotion: data.emotion,
      visibility: data.visibility as ContentVisibility,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
    });
    
    // If this is a public post, add to user's token rewards
    if (data.visibility === 'public') {
      await storage.createRewardActivity(
        req.user!.id,
        'journal_entry',
        5, // Token reward for sharing publicly
        'Shared emotions with the community'
      );
    }
    
    res.status(201).json(post);
  } catch (error: any) {
    console.error('Error creating community post:', error);
    res.status(400).json({ error: error.message || 'Failed to create community post' });
  }
});

// Get post comments
router.get('/posts/:postId/comments', requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.isAuthenticated() ? req.user!.id : 0;
    
    // Check if post exists and if user can view it
    const post = await storage.getCommunityPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const canView = await canUserViewPost(userId, post.userId, post.visibility as ContentVisibility);
    if (!canView) {
      return res.status(403).json({ error: 'You do not have permission to view this post' });
    }
    
    const comments = await storage.getPostComments(postId);
    res.status(200).json(comments);
  } catch (error: any) {
    console.error('Error fetching post comments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch post comments' });
  }
});

// Add a comment to a post
router.post('/posts/:postId/comments', requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = createCommentSchema.parse(req.body);
    
    // Check if post exists and if user can view/comment
    const post = await storage.getCommunityPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const canView = await canUserViewPost(req.user!.id, post.userId, post.visibility as ContentVisibility);
    if (!canView) {
      return res.status(403).json({ error: 'You do not have permission to comment on this post' });
    }
    
    const comment = await storage.createPostComment({
      postId,
      userId: req.user!.id,
      content,
    });
    
    // If commenting on someone else's post, add to token rewards for community engagement
    if (post.userId !== req.user!.id) {
      await storage.createRewardActivity(
        req.user!.id,
        'help_others',
        2, // Token reward for community engagement
        'Provided support in community discussions'
      );
    }
    
    res.status(201).json(comment);
  } catch (error: any) {
    console.error('Error creating post comment:', error);
    res.status(400).json({ error: error.message || 'Failed to create post comment' });
  }
});

// Like a post
router.post('/posts/:postId/like', requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    // Check if post exists and if user can view it
    const post = await storage.getCommunityPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const canView = await canUserViewPost(req.user!.id, post.userId, post.visibility as ContentVisibility);
    if (!canView) {
      return res.status(403).json({ error: 'You do not have permission to like this post' });
    }
    
    const liked = await storage.likePost(postId, req.user!.id);
    res.status(200).json({ success: true, liked });
  } catch (error: any) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: error.message || 'Failed to like post' });
  }
});

// Unlike a post
router.post('/posts/:postId/unlike', requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    const unliked = await storage.unlikePost(postId, req.user!.id);
    res.status(200).json({ success: true, unliked });
  } catch (error: any) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: error.message || 'Failed to unlike post' });
  }
});

// Get support groups
router.get('/support-groups', requireAuth, async (req, res) => {
  try {
    // Support groups are available to all users
    const groups = await storage.getSupportGroups();
    res.status(200).json(groups);
  } catch (error: any) {
    console.error('Error fetching support groups:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch support groups' });
  }
});

// Get support group by ID
router.get('/support-groups/:groupId', requireAuth, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = await storage.getSupportGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Support group not found' });
    }
    
    res.status(200).json(group);
  } catch (error: any) {
    console.error('Error fetching support group:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch support group' });
  }
});

// Join a support group
router.post('/support-groups/:groupId/join', requireAuth, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const success = await storage.joinSupportGroup(req.user!.id, groupId);
    
    if (!success) {
      return res.status(404).json({ error: 'Support group not found' });
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error joining support group:', error);
    res.status(500).json({ error: error.message || 'Failed to join support group' });
  }
});

// Leave a support group
router.post('/support-groups/:groupId/leave', requireAuth, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const success = await storage.leaveSupportGroup(req.user!.id, groupId);
    
    if (!success) {
      return res.status(404).json({ error: 'Support group not found' });
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error leaving support group:', error);
    res.status(500).json({ error: error.message || 'Failed to leave support group' });
  }
});

// Get expert tips
router.get('/expert-tips', requireAuth, async (req, res) => {
  try {
    // Expert tips are available to all users
    const category = req.query.category as string;
    const tips = await storage.getExpertTips(category);
    res.status(200).json(tips);
  } catch (error: any) {
    console.error('Error fetching expert tips:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch expert tips' });
  }
});

export default router;