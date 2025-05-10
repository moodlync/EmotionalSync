import { relations } from "drizzle-orm";
import { text, integer, timestamp, json, pgTable, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Individual emotion moments that make up a story
export const emotionMoments = pgTable("emotion_moments", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  emotionType: text("emotion_type").notNull(), // e.g., "happy", "sad", "angry", etc.
  intensity: integer("intensity").notNull(), // 1-10 scale
  description: text("description"),
  media: text("media"), // Optional URL to image/audio
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  order: integer("order").notNull(), // Position in the story
  metadata: json("metadata").$type<Record<string, any>>(), // Additional customizable fields
});

// Relations for emotion moments
export const emotionMomentsRelations = relations(emotionMoments, ({ one }) => ({
  story: one(emotionStories, {
    fields: [emotionMoments.storyId],
    references: [emotionStories.id],
  }),
}));

// Main stories that contain multiple emotion moments
export const emotionStories = pgTable("emotion_stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  isPublic: integer("is_public").default(0).notNull(), // 0=private, 1=public
  allowComments: integer("allow_comments").default(1).notNull(), // 0=no, 1=yes
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
  tags: json("tags").$type<string[]>().default([]),
  emotionalArc: json("emotional_arc").$type<{
    start: string;
    end: string;
    peak: string;
    resolution: string;
  }>(),
  theme: text("theme").default("default"), // Visual theme for the story
});

// Relations for emotion stories
export const emotionStoriesRelations = relations(emotionStories, ({ one, many }) => ({
  user: one(users, {
    fields: [emotionStories.userId],
    references: [users.id],
  }),
  moments: many(emotionMoments),
  comments: many(storyComments),
  reactions: many(storyReactions),
}));

// Comments on stories
export const storyComments = pgTable("story_comments", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  created: timestamp("created").defaultNow().notNull(),
  parentId: integer("parent_id"), // For threaded comments; null for top-level
});

// Relations for story comments
export const storyCommentsRelations = relations(storyComments, ({ one }) => ({
  story: one(emotionStories, {
    fields: [storyComments.storyId],
    references: [emotionStories.id],
  }),
  user: one(users, {
    fields: [storyComments.userId],
    references: [users.id],
  }),
  parent: one(storyComments, {
    fields: [storyComments.parentId],
    references: [storyComments.id],
  }),
}));

// Reactions to stories (likes, empathy, etc.)
export const storyReactions = pgTable("story_reactions", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  userId: integer("user_id").notNull(),
  reactionType: text("reaction_type").notNull(), // "like", "empathy", "inspiring", etc.
  created: timestamp("created").defaultNow().notNull(),
});

// Relations for story reactions
export const storyReactionsRelations = relations(storyReactions, ({ one }) => ({
  story: one(emotionStories, {
    fields: [storyReactions.storyId],
    references: [emotionStories.id],
  }),
  user: one(users, {
    fields: [storyReactions.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertEmotionMomentSchema = createInsertSchema(emotionMoments)
  .omit({ id: true })
  .extend({
    intensity: z.number().min(1).max(10),
    order: z.number().min(0),
  });

export const insertEmotionStorySchema = createInsertSchema(emotionStories)
  .omit({ id: true, created: true, updated: true })
  .extend({
    title: z.string().min(1).max(100),
    isPublic: z.number().min(0).max(1),
    allowComments: z.number().min(0).max(1),
    tags: z.array(z.string()),
  });

export const insertStoryCommentSchema = createInsertSchema(storyComments)
  .omit({ id: true, created: true })
  .extend({
    content: z.string().min(1).max(1000),
  });

export const insertStoryReactionSchema = createInsertSchema(storyReactions)
  .omit({ id: true, created: true })
  .extend({
    reactionType: z.enum(["like", "empathy", "inspiring", "relatable", "insightful"]),
  });

// Types
export type EmotionMoment = typeof emotionMoments.$inferSelect;
export type InsertEmotionMoment = z.infer<typeof insertEmotionMomentSchema>;

export type EmotionStory = typeof emotionStories.$inferSelect;
export type InsertEmotionStory = z.infer<typeof insertEmotionStorySchema>;

export type StoryComment = typeof storyComments.$inferSelect;
export type InsertStoryComment = z.infer<typeof insertStoryCommentSchema>;

export type StoryReaction = typeof storyReactions.$inferSelect;
export type InsertStoryReaction = z.infer<typeof insertStoryReactionSchema>;