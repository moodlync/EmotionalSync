import { Router } from 'express';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { requireAuth } from '../middleware';

// Profile update validation schema
const profileUpdateSchema = z.object({
  displayName: z.string().max(30).optional(),
  bio: z.string().max(250).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ru']).optional(),
  dailyReminder: z.boolean().optional(),
  weeklyInsights: z.boolean().optional(),
  publicProfileLink: z.string().regex(/^[a-zA-Z0-9_]+$/).max(30).optional(),
  moodGoal: z.enum(['improve_mindfulness', 'track_stress', 'better_sleep', 'reduce_anxiety', 'increase_happiness']).optional(),
  dailyCheckInTime: z.string().optional(),
});

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueId = createId();
      const fileExtension = path.extname(file.originalname);
      cb(null, `${uniqueId}${fileExtension}`);
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});

export function registerProfileRoutes(router: Router) {
  // Update profile picture route
  router.post('/profile/picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
    try {
      const userId = req.user?.id as number;
      
      // If 'remove' parameter is true, remove the profile picture
      if (req.body.remove === 'true') {
        // Get the current profile picture path
        const user = await storage.getUser(userId);
        if (user && user.profilePicture) {
          // Get the filename from the URL
          const filename = path.basename(user.profilePicture);
          const filePath = path.join(__dirname, '../../uploads', filename);
          
          // Remove the file if it exists
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        
        // Update the user record
        const updatedUser = await storage.updateUserProfile(userId, { profilePicture: null });
        return res.json({ success: true, profilePicture: null });
      }
      
      // If a file was uploaded, process it
      if (req.file) {
        // Generate URL for the profile picture
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const profilePicture = `${baseUrl}/uploads/${req.file.filename}`;
        
        // Update the user record
        const updatedUser = await storage.updateUserProfile(userId, { profilePicture });
        
        // Return the updated user data
        return res.json({ success: true, profilePicture });
      }
      
      // If no file was uploaded and no remove parameter, return an error
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update profile information route
  router.post('/profile/update', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id as number;
      
      // Validate request body
      const result = profileUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid profile data',
          errors: result.error.errors
        });
      }
      
      const validatedData = result.data;
      
      // Check if publicProfileLink is already taken (if provided)
      if (validatedData.publicProfileLink) {
        const existing = await storage.getUserByProfileLink(validatedData.publicProfileLink);
        if (existing && existing.id !== userId) {
          return res.status(400).json({
            success: false,
            message: 'This profile link is already taken. Please choose a different one.'
          });
        }
      }
      
      // Create notification settings update object
      const notificationSettings: any = {};
      if (validatedData.dailyReminder !== undefined) {
        notificationSettings.dailyReminder = validatedData.dailyReminder;
      }
      if (validatedData.weeklyInsights !== undefined) {
        notificationSettings.weeklyInsights = validatedData.weeklyInsights;
      }
      
      // Create the profile update object
      const profileUpdate: any = {
        displayName: validatedData.displayName,
        bio: validatedData.bio,
        theme: validatedData.theme,
        language: validatedData.language,
        publicProfileLink: validatedData.publicProfileLink,
        moodGoal: validatedData.moodGoal,
        dailyCheckInTime: validatedData.dailyCheckInTime,
      };
      
      // Remove undefined fields
      Object.keys(profileUpdate).forEach(key => {
        if (profileUpdate[key] === undefined) {
          delete profileUpdate[key];
        }
      });
      
      // Update notification settings if needed
      if (Object.keys(notificationSettings).length > 0) {
        await storage.updateUserNotificationSettings(userId, notificationSettings);
      }
      
      // Update the profile
      const updatedUser = await storage.updateUserProfile(userId, profileUpdate);
      
      // Merge updated data
      const responseData = {
        ...profileUpdate,
        notificationSettings: Object.keys(notificationSettings).length > 0 ? notificationSettings : undefined
      };
      
      return res.json({ success: true, ...responseData });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
  
  // Get user profile route
  router.get('/profile', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Get notification settings
      const notificationSettings = await storage.getUserNotificationSettings(userId);
      
      // Construct response
      const profileData = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        theme: user.theme,
        language: user.language,
        publicProfileLink: user.publicProfileLink,
        moodGoal: user.moodGoal,
        dailyCheckInTime: user.dailyCheckInTime,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        notificationSettings
      };
      
      return res.json({ success: true, profile: profileData });
    } catch (error: any) {
      console.error('Error getting profile:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
  
  console.log('Profile routes registered successfully');
}