import { Express, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

export function registerEmotionalIntelligenceRoutes(app: Express) {
  // Save quiz results
  app.post('/api/emotional-intelligence/results', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { totalScore, categoryScores, completedAt } = req.body;
      
      if (!totalScore || !categoryScores || !completedAt) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Save the quiz results
      const result = await storage.saveEmotionalIntelligenceResults({
        userId,
        totalScore,
        categoryScores: JSON.stringify(categoryScores),
        completedAt: new Date(completedAt)
      });
      
      // Update user profile with EQ score if this is first assessment or if score is higher
      await storage.updateUserEqScore(userId, totalScore);
      
      return res.status(201).json({ success: true, result });
    } catch (error) {
      console.error('Error saving emotional intelligence results:', error);
      res.status(500).json({ error: 'Failed to save quiz results' });
    }
  });
  
  // Get user's quiz results history
  app.get('/api/emotional-intelligence/results', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const results = await storage.getEmotionalIntelligenceResults(userId);
      
      return res.json(results);
    } catch (error) {
      console.error('Error getting emotional intelligence results:', error);
      res.status(500).json({ error: 'Failed to get quiz results' });
    }
  });
  
  // Get user's latest quiz result
  app.get('/api/emotional-intelligence/results/latest', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const result = await storage.getLatestEmotionalIntelligenceResult(userId);
      
      if (!result) {
        return res.status(404).json({ error: 'No quiz results found' });
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error getting latest emotional intelligence result:', error);
      res.status(500).json({ error: 'Failed to get latest quiz result' });
    }
  });
  
  console.log('Emotional intelligence quiz routes registered successfully');
}