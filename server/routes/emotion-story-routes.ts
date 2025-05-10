import { Request, Response, Router } from "express";
import { db } from "../db";
import { 
  emotionMoments, 
  emotionStories, 
  storyComments, 
  storyReactions,
  insertEmotionMomentSchema,
  insertEmotionStorySchema,
  insertStoryCommentSchema,
  insertStoryReactionSchema 
} from "../../shared/emotion-story-schema";
import { eq, and, or, desc, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};

// Get all stories (public ones or user's own)
router.get("/api/emotion-stories", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get either public stories or the user's own stories
    const stories = await db
      .select()
      .from(emotionStories)
      .where(
        or(
          eq(emotionStories.isPublic, 1),
          eq(emotionStories.userId, userId)
        )
      )
      .orderBy(desc(emotionStories.created));
    
    return res.json(stories);
  } catch (error) {
    console.error("Error fetching emotion stories:", error);
    return res.status(500).json({ error: "Failed to fetch emotion stories" });
  }
});

// Get user's own stories
router.get("/api/emotion-stories/my", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const stories = await db
      .select()
      .from(emotionStories)
      .where(eq(emotionStories.userId, userId))
      .orderBy(desc(emotionStories.created));
    
    return res.json(stories);
  } catch (error) {
    console.error("Error fetching user's emotion stories:", error);
    return res.status(500).json({ error: "Failed to fetch your emotion stories" });
  }
});

// Get a specific story with its moments
router.get("/api/emotion-stories/:id", isAuthenticated, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Get the story
    const [story] = await db
      .select()
      .from(emotionStories)
      .where(
        and(
          eq(emotionStories.id, storyId),
          or(
            eq(emotionStories.isPublic, 1),
            eq(emotionStories.userId, userId)
          )
        )
      );
    
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    // Get the moments for this story
    const moments = await db
      .select()
      .from(emotionMoments)
      .where(eq(emotionMoments.storyId, storyId))
      .orderBy(asc(emotionMoments.order));
    
    // Get comments if allowed
    const comments = story.allowComments === 1 
      ? await db
          .select()
          .from(storyComments)
          .where(eq(storyComments.storyId, storyId))
          .orderBy(asc(storyComments.created))
      : [];
    
    // Get reactions
    const reactions = await db
      .select()
      .from(storyReactions)
      .where(eq(storyReactions.storyId, storyId));
    
    // Check if the current user has reacted
    const userReactions = reactions.filter(r => r.userId === userId);
    
    return res.json({
      story,
      moments,
      comments,
      reactions: {
        counts: countReactionsByType(reactions),
        userReactions: userReactions.map(r => r.reactionType)
      }
    });
  } catch (error) {
    console.error("Error fetching emotion story:", error);
    return res.status(500).json({ error: "Failed to fetch emotion story" });
  }
});

// Helper function to count reactions by type
function countReactionsByType(reactions: any[]) {
  const counts: Record<string, number> = {};
  
  for (const reaction of reactions) {
    const type = reaction.reactionType;
    counts[type] = (counts[type] || 0) + 1;
  }
  
  return counts;
}

// Create a new story
router.post("/api/emotion-stories", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate the request body
    const validatedData = insertEmotionStorySchema.parse({
      ...req.body,
      userId
    });
    
    // Insert the story
    const [newStory] = await db
      .insert(emotionStories)
      .values([validatedData])
      .returning();
    
    return res.status(201).json(newStory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error creating emotion story:", error);
    return res.status(500).json({ error: "Failed to create emotion story" });
  }
});

// Update a story
router.put("/api/emotion-stories/:id", isAuthenticated, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the story exists and belongs to the user
    const [existingStory] = await db
      .select()
      .from(emotionStories)
      .where(
        and(
          eq(emotionStories.id, storyId),
          eq(emotionStories.userId, userId)
        )
      );
    
    if (!existingStory) {
      return res.status(404).json({ error: "Story not found or you don't have permission to edit it" });
    }
    
    // Validate the request body
    const validatedData = insertEmotionStorySchema
      .omit({ userId: true })
      .parse(req.body);
    
    // Update the story
    const [updatedStory] = await db
      .update(emotionStories)
      .set({
        ...validatedData,
        updated: new Date()
      })
      .where(eq(emotionStories.id, storyId))
      .returning();
    
    return res.json(updatedStory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error updating emotion story:", error);
    return res.status(500).json({ error: "Failed to update emotion story" });
  }
});

// Delete a story
router.delete("/api/emotion-stories/:id", isAuthenticated, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the story exists and belongs to the user
    const [existingStory] = await db
      .select()
      .from(emotionStories)
      .where(
        and(
          eq(emotionStories.id, storyId),
          eq(emotionStories.userId, userId)
        )
      );
    
    if (!existingStory) {
      return res.status(404).json({ error: "Story not found or you don't have permission to delete it" });
    }
    
    // Delete all associated data first
    await db
      .delete(storyReactions)
      .where(eq(storyReactions.storyId, storyId));
      
    await db
      .delete(storyComments)
      .where(eq(storyComments.storyId, storyId));
      
    await db
      .delete(emotionMoments)
      .where(eq(emotionMoments.storyId, storyId));
    
    // Delete the story
    await db
      .delete(emotionStories)
      .where(eq(emotionStories.id, storyId));
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting emotion story:", error);
    return res.status(500).json({ error: "Failed to delete emotion story" });
  }
});

// Add a moment to a story
router.post("/api/emotion-stories/:id/moments", isAuthenticated, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the story exists and belongs to the user
    const [existingStory] = await db
      .select()
      .from(emotionStories)
      .where(
        and(
          eq(emotionStories.id, storyId),
          eq(emotionStories.userId, userId)
        )
      );
    
    if (!existingStory) {
      return res.status(404).json({ error: "Story not found or you don't have permission to add moments" });
    }
    
    // Validate the request body
    const validatedData = insertEmotionMomentSchema.parse({
      ...req.body,
      storyId
    });
    
    // Insert the moment
    const [newMoment] = await db
      .insert(emotionMoments)
      .values([validatedData])
      .returning();
    
    // Update the story's updated timestamp
    await db
      .update(emotionStories)
      .set({ updated: new Date() })
      .where(eq(emotionStories.id, storyId));
    
    return res.status(201).json(newMoment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error adding emotion moment:", error);
    return res.status(500).json({ error: "Failed to add emotion moment" });
  }
});

// Update a moment
router.put("/api/emotion-moments/:id", isAuthenticated, async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the moment exists and belongs to the user's story
    const [existingMoment] = await db
      .select({
        moment: emotionMoments,
        story: emotionStories
      })
      .from(emotionMoments)
      .innerJoin(
        emotionStories,
        eq(emotionMoments.storyId, emotionStories.id)
      )
      .where(
        and(
          eq(emotionMoments.id, momentId),
          eq(emotionStories.userId, userId)
        )
      );
    
    if (!existingMoment) {
      return res.status(404).json({ error: "Moment not found or you don't have permission to edit it" });
    }
    
    // Validate the request body
    const validatedData = insertEmotionMomentSchema
      .omit({ storyId: true })
      .parse(req.body);
    
    // Update the moment
    const [updatedMoment] = await db
      .update(emotionMoments)
      .set(validatedData)
      .where(eq(emotionMoments.id, momentId))
      .returning();
    
    // Update the story's updated timestamp
    await db
      .update(emotionStories)
      .set({ updated: new Date() })
      .where(eq(emotionStories.id, existingMoment.moment.storyId));
    
    return res.json(updatedMoment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error updating emotion moment:", error);
    return res.status(500).json({ error: "Failed to update emotion moment" });
  }
});

// Delete a moment
router.delete("/api/emotion-moments/:id", isAuthenticated, async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the moment exists and belongs to the user's story
    const [existingMoment] = await db
      .select()
      .from(emotionMoments)
      .innerJoin(
        emotionStories,
        eq(emotionMoments.storyId, emotionStories.id)
      )
      .where(
        and(
          eq(emotionMoments.id, momentId),
          eq(emotionStories.userId, userId)
        )
      );
    
    if (!existingMoment) {
      return res.status(404).json({ error: "Moment not found or you don't have permission to delete it" });
    }
    
    // Delete the moment
    await db
      .delete(emotionMoments)
      .where(eq(emotionMoments.id, momentId));
    
    // Update the story's updated timestamp
    await db
      .update(emotionStories)
      .set({ updated: new Date() })
      .where(eq(emotionStories.id, existingMoment.moment.storyId));
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting emotion moment:", error);
    return res.status(500).json({ error: "Failed to delete emotion moment" });
  }
});

// Add a comment to a story
router.post("/api/emotion-stories/:id/comments", isAuthenticated, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the story exists and allows comments
    const [existingStory] = await db
      .select()
      .from(emotionStories)
      .where(
        and(
          eq(emotionStories.id, storyId),
          or(
            eq(emotionStories.isPublic, 1),
            eq(emotionStories.userId, userId)
          ),
          eq(emotionStories.allowComments, 1)
        )
      );
    
    if (!existingStory) {
      return res.status(404).json({ error: "Story not found, is private, or doesn't allow comments" });
    }
    
    // Validate the request body
    const validatedData = insertStoryCommentSchema.parse({
      ...req.body,
      storyId,
      userId
    });
    
    // Insert the comment
    const [newComment] = await db
      .insert(storyComments)
      .values([validatedData])
      .returning();
    
    return res.status(201).json(newComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error adding comment:", error);
    return res.status(500).json({ error: "Failed to add comment" });
  }
});

// Delete a comment
router.delete("/api/story-comments/:id", isAuthenticated, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the comment exists and belongs to the user
    const [existingComment] = await db
      .select()
      .from(storyComments)
      .where(
        and(
          eq(storyComments.id, commentId),
          eq(storyComments.userId, userId)
        )
      );
    
    if (!existingComment) {
      // Also check if the user is the story owner
      const [commentOnUserStory] = await db
        .select()
        .from(storyComments)
        .innerJoin(
          emotionStories,
          eq(storyComments.storyId, emotionStories.id)
        )
        .where(
          and(
            eq(storyComments.id, commentId),
            eq(emotionStories.userId, userId)
          )
        );
      
      if (!commentOnUserStory) {
        return res.status(404).json({ error: "Comment not found or you don't have permission to delete it" });
      }
    }
    
    // Delete the comment
    await db
      .delete(storyComments)
      .where(eq(storyComments.id, commentId));
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Add or update a reaction to a story
router.post("/api/emotion-stories/:id/reactions", isAuthenticated, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Check if the story exists
    const [existingStory] = await db
      .select()
      .from(emotionStories)
      .where(
        and(
          eq(emotionStories.id, storyId),
          or(
            eq(emotionStories.isPublic, 1),
            eq(emotionStories.userId, userId)
          )
        )
      );
    
    if (!existingStory) {
      return res.status(404).json({ error: "Story not found or is private" });
    }
    
    // Validate the request body
    const validatedData = insertStoryReactionSchema.parse({
      ...req.body,
      storyId,
      userId
    });
    
    // Check if user has already reacted with this type
    const [existingReaction] = await db
      .select()
      .from(storyReactions)
      .where(
        and(
          eq(storyReactions.storyId, storyId),
          eq(storyReactions.userId, userId),
          eq(storyReactions.reactionType, validatedData.reactionType)
        )
      );
    
    if (existingReaction) {
      // If reaction exists, remove it (toggle behavior)
      await db
        .delete(storyReactions)
        .where(eq(storyReactions.id, existingReaction.id));
      
      return res.json({ success: true, action: "removed" });
    } else {
      // Insert the reaction
      const [newReaction] = await db
        .insert(storyReactions)
        .values([validatedData])
        .returning();
      
      return res.status(201).json({ success: true, action: "added", reaction: newReaction });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error adding reaction:", error);
    return res.status(500).json({ error: "Failed to add reaction" });
  }
});

export default router;