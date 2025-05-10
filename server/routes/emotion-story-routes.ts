import { Router } from "express";
import { db } from "../db";
import { emotionStories, emotionMoments, storyComments, storyReactions } from "@shared/emotion-story-schema";
import { Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { insertEmotionStorySchema, insertEmotionMomentSchema, insertStoryCommentSchema } from "@shared/emotion-story-schema";
import { z } from "zod";

const router = Router();

// Get all public stories
router.get("/api/emotion-stories", requireAuth, async (req, res) => {
  try {
    const publicStories = await db
      .select()
      .from(emotionStories)
      .where(eq(emotionStories.isPublic, 1))
      .orderBy(desc(emotionStories.created))
      .limit(100);
    
    return res.json(publicStories);
  } catch (error) {
    console.error("Error fetching emotion stories:", error);
    return res.status(500).json({ error: "Failed to fetch emotion stories" });
  }
});

// Get current user's stories
router.get("/api/emotion-stories/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const myStories = await db
      .select()
      .from(emotionStories)
      .where(eq(emotionStories.userId, userId))
      .orderBy(desc(emotionStories.created));
    
    return res.json(myStories);
  } catch (error) {
    console.error("Error fetching user's emotion stories:", error);
    return res.status(500).json({ error: "Failed to fetch your emotion stories" });
  }
});

// Get a single story with moments and comments
router.get("/api/emotion-stories/:id", requireAuth, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Fetch the story
    const [story] = await db
      .select()
      .from(emotionStories)
      .where(eq(emotionStories.id, storyId));
    
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    // Check if the user is allowed to view this story
    if (story.isPublic !== 1 && story.userId !== userId) {
      return res.status(403).json({ error: "You don't have permission to view this story" });
    }
    
    // Fetch moments for this story
    const moments = await db
      .select()
      .from(emotionMoments)
      .where(eq(emotionMoments.storyId, storyId))
      .orderBy(asc(emotionMoments.order));
    
    // Fetch comments if allowed
    let comments = [];
    if (story.allowComments === 1) {
      comments = await db
        .select()
        .from(storyComments)
        .where(eq(storyComments.storyId, storyId))
        .orderBy(asc(storyComments.created));
    }
    
    // Fetch reactions
    const reactions = await db
      .select()
      .from(storyReactions)
      .where(eq(storyReactions.storyId, storyId));
    
    // Count reactions by type
    const reactionCounts: Record<string, number> = {};
    const userReactions: string[] = [];
    
    reactions.forEach(reaction => {
      if (!reactionCounts[reaction.reactionType]) {
        reactionCounts[reaction.reactionType] = 0;
      }
      reactionCounts[reaction.reactionType]++;
      
      if (reaction.userId === userId) {
        userReactions.push(reaction.reactionType);
      }
    });
    
    return res.json({
      story,
      moments,
      comments,
      reactions: {
        counts: reactionCounts,
        userReactions
      }
    });
  } catch (error) {
    console.error("Error fetching emotion story details:", error);
    return res.status(500).json({ error: "Failed to fetch story details" });
  }
});

// Create a new story
router.post("/api/emotion-stories", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate the request body
    const validatedData = insertEmotionStorySchema.parse({
      ...req.body,
      userId,
      created: new Date(),
      updated: new Date()
    });
    
    // Create the story
    const [newStory] = await db
      .insert(emotionStories)
      .values(validatedData)
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
router.patch("/api/emotion-stories/:id", requireAuth, async (req, res) => {
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
      .omit({ userId: true, created: true })
      .parse({
        ...req.body,
        updated: new Date()
      });
    
    // Update the story
    const [updatedStory] = await db
      .update(emotionStories)
      .set(validatedData)
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
router.delete("/api/emotion-stories/:id", requireAuth, async (req, res) => {
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
    
    // Delete all associated moments
    await db
      .delete(emotionMoments)
      .where(eq(emotionMoments.storyId, storyId));
    
    // Delete all associated comments
    await db
      .delete(storyComments)
      .where(eq(storyComments.storyId, storyId));
    
    // Delete all associated reactions
    await db
      .delete(storyReactions)
      .where(eq(storyReactions.storyId, storyId));
    
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
router.post("/api/emotion-stories/:id/moments", requireAuth, async (req, res) => {
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
      return res.status(404).json({ error: "Story not found or you don't have permission to add moments to it" });
    }
    
    // Validate the request body
    const validatedData = insertEmotionMomentSchema.parse({
      ...req.body,
      storyId,
      timestamp: new Date()
    });
    
    // Create the moment
    const [newMoment] = await db
      .insert(emotionMoments)
      .values(validatedData)
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
router.patch("/api/emotion-moments/:id", requireAuth, async (req, res) => {
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
      .where(eq(emotionStories.id, existingMoment.story.id));
    
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
router.delete("/api/emotion-moments/:id", requireAuth, async (req, res) => {
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
      .where(eq(emotionStories.id, existingMoment.story.id));
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting emotion moment:", error);
    return res.status(500).json({ error: "Failed to delete emotion moment" });
  }
});

// Add a comment to a story
router.post("/api/emotion-stories/:id/comments", requireAuth, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    // Fetch the story to check if it exists and allows comments
    const [story] = await db
      .select()
      .from(emotionStories)
      .where(eq(emotionStories.id, storyId));
    
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    if (story.allowComments !== 1) {
      return res.status(403).json({ error: "This story does not allow comments" });
    }
    
    // Check if the user has permission to comment (if the story is private)
    if (story.isPublic !== 1 && story.userId !== userId) {
      return res.status(403).json({ error: "You don't have permission to comment on this story" });
    }
    
    // Validate the request body
    const validatedData = insertStoryCommentSchema.parse({
      ...req.body,
      userId,
      storyId,
      created: new Date()
    });
    
    // Create the comment
    const [newComment] = await db
      .insert(storyComments)
      .values(validatedData)
      .returning();
    
    // Update the story's updated timestamp
    await db
      .update(emotionStories)
      .set({ updated: new Date() })
      .where(eq(emotionStories.id, storyId));
    
    return res.status(201).json(newComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error adding comment:", error);
    return res.status(500).json({ error: "Failed to add comment" });
  }
});

// Add a reaction to a story
router.post("/api/emotion-stories/:id/reactions", requireAuth, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    const { reactionType } = req.body;
    
    if (!reactionType) {
      return res.status(400).json({ error: "Reaction type is required" });
    }
    
    // Check if the story exists
    const [story] = await db
      .select()
      .from(emotionStories)
      .where(eq(emotionStories.id, storyId));
    
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    // Check if the user has permission to react (if the story is private)
    if (story.isPublic !== 1 && story.userId !== userId) {
      return res.status(403).json({ error: "You don't have permission to react to this story" });
    }
    
    // Check if the user has already reacted with this type
    const [existingReaction] = await db
      .select()
      .from(storyReactions)
      .where(
        and(
          eq(storyReactions.storyId, storyId),
          eq(storyReactions.userId, userId),
          eq(storyReactions.reactionType, reactionType)
        )
      );
    
    if (existingReaction) {
      // If the user has already reacted with this type, remove it (toggle behavior)
      await db
        .delete(storyReactions)
        .where(eq(storyReactions.id, existingReaction.id));
      
      return res.json({ success: true, added: false });
    } else {
      // Add the new reaction
      const [newReaction] = await db
        .insert(storyReactions)
        .values({
          storyId,
          userId,
          reactionType,
          created: new Date()
        })
        .returning();
      
      return res.status(201).json({ success: true, added: true, reaction: newReaction });
    }
  } catch (error) {
    console.error("Error adding reaction:", error);
    return res.status(500).json({ error: "Failed to add reaction" });
  }
});

export default router;