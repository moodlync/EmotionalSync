// Perplexity API Analysis Routes for MoodLync
// These routes provide AI-powered emotional analysis using Perplexity

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { analyzeEmotionWithPerplexity } from '../../perplexity-api-client';
import { storage } from '../storage';

// Create router
const router = Router();

/**
 * Analyze text for emotional content
 * This endpoint uses Perplexity AI to analyze emotional content in text
 */
router.post('/api/analyze/emotion', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Please provide valid text for analysis' 
      });
    }
    
    // Check for API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Emotion analysis service is not configured'
      });
    }
    
    // Call Perplexity API
    const analysis = await analyzeEmotionWithPerplexity(apiKey, text);
    
    // Store the analysis result in the user's history
    const userId = req.user!.id;
    await storage.saveEmotionAnalysisResult({
      userId,
      text: text.substring(0, 200), // Store truncated text to save space
      result: JSON.stringify(analysis),
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing emotion with Perplexity:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Get emotion analysis history for the current user
 */
router.get('/api/analyze/emotion/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const history = await storage.getEmotionAnalysisHistory(userId);
    
    // Transform the results for the client
    const formattedHistory = history.map(item => ({
      id: item.id,
      text: item.text,
      analysis: JSON.parse(item.result),
      timestamp: item.timestamp
    }));
    
    res.json({
      success: true,
      history: formattedHistory
    });
    
  } catch (error) {
    console.error('Error retrieving emotion analysis history:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve history', 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Journal entry analysis
 * This endpoint analyzes a journal entry and provides emotional insights
 */
router.post('/api/journal/analyze', requireAuth, async (req, res) => {
  try {
    const { journalText, journalId } = req.body;
    
    if (!journalText || typeof journalText !== 'string' || journalText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Please provide valid journal text for analysis' 
      });
    }
    
    // Check for API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Journal analysis service is not configured'
      });
    }
    
    // Call Perplexity API with a specialized system prompt for journals
    const analysis = await analyzeEmotionWithPerplexity(apiKey, journalText);
    
    // If we have a journal ID, update it with the analysis
    if (journalId) {
      await storage.updateJournalWithAnalysis(journalId, analysis);
    }
    
    res.json({
      success: true,
      journalId,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing journal with Perplexity:', error);
    res.status(500).json({ 
      error: 'Journal analysis failed', 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Test Perplexity API connection
 * This is a simple endpoint to verify the API key is working
 */
router.get('/api/analyze/test', requireAuth, async (req, res) => {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Perplexity API key is not configured'
      });
    }
    
    // Simple test with a predetermined text
    const testText = "I feel really happy today because I achieved my goal.";
    const analysis = await analyzeEmotionWithPerplexity(apiKey, testText);
    
    res.json({
      success: true,
      message: 'Perplexity API connection successful',
      testAnalysis: analysis
    });
    
  } catch (error) {
    console.error('Error testing Perplexity API connection:', error);
    res.status(500).json({ 
      error: 'Connection test failed', 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;