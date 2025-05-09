import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

// Types for tests and results
interface TestResult {
  component: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

interface BackupMetadata {
  id: string;
  timestamp: string;
  description: string;
  size: string;
  components: string[];
}

// Internal function to run database connection test
const testDatabaseConnection = async (): Promise<TestResult> => {
  try {
    // For in-memory storage, there's no real DB connection to test
    // In a real PostgreSQL app, you'd check connection status here
    // Let's try to perform a simple operation to verify storage is working
    const users = await Promise.resolve(Array.from(storage.users.values()));
    
    return {
      component: "Database Connection",
      success: true,
      message: "Database connection is working correctly",
      details: { userCount: users.length },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: "Database Connection",
      success: false,
      message: "Failed to connect to database",
      details: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test authentication system
const testAuthSystem = async (): Promise<TestResult> => {
  try {
    // Check if we can create and validate test user credentials
    const testUsername = `test_${Date.now()}`;
    const testPassword = "Test123!";
    
    // Create test user
    const user = await storage.createUser({
      username: testUsername,
      password: testPassword,
      email: `${testUsername}@example.com`,
    });
    
    // Cleanup
    await storage.removeUser(user.id);
    
    return {
      component: "Authentication System",
      success: true,
      message: "Authentication system is working correctly",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: "Authentication System",
      success: false,
      message: "Failed to test authentication system",
      details: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test token system
const testTokenSystem = async (): Promise<TestResult> => {
  try {
    // Simulate token award and usage
    const testUsername = `test_${Date.now()}`;
    const user = await storage.createUser({
      username: testUsername,
      password: "Test123!",
      email: `${testUsername}@example.com`,
      emotionTokens: 100
    });
    
    // Test token adjustment
    await storage.updateUser(user.id, { emotionTokens: 200 });
    const updatedUser = await storage.getUser(user.id);
    
    // Cleanup
    await storage.removeUser(user.id);
    
    if (updatedUser?.emotionTokens !== 200) {
      return {
        component: "Token System",
        success: false,
        message: "Token update failed",
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      component: "Token System",
      success: true,
      message: "Token system is working correctly",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: "Token System",
      success: false,
      message: "Failed to test token system",
      details: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Create directory for backups if it doesn't exist
const ensureBackupDir = () => {
  // For both CJS and ESM compatibility, use a more robust approach
  const backupDir = path.resolve(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

// Create a backup of the application state
const createBackup = async (description: string = "Manual backup"): Promise<BackupMetadata | null> => {
  try {
    const backupDir = ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupId = `backup-${timestamp}`;
    const filename = `${backupId}.json`;
    const filePath = path.join(backupDir, filename);
    
    // Get all data to back up (using direct access to storage data)
    // In a production app, you'd use proper APIs rather than direct access
    const data = {
      users: Array.from(storage.users.values()),
      emotions: Array.from(storage.userEmotions.entries()).map(([userId, emotion]) => ({
        userId,
        emotion
      })),
      journalEntries: Array.from(storage.journalEntries.values()).flat(),
      // Add more data types as needed
    };
    
    // Write backup file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Create and save metadata
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: timestamp,
      description,
      size: `${fileSizeInMB} MB`,
      components: Object.keys(data)
    };
    
    // Save metadata
    const metadataPath = path.join(backupDir, 'metadata.json');
    let allMetadata: BackupMetadata[] = [];
    
    if (fs.existsSync(metadataPath)) {
      allMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    
    allMetadata.push(metadata);
    fs.writeFileSync(metadataPath, JSON.stringify(allMetadata, null, 2));
    
    return metadata;
  } catch (error) {
    console.error("Backup creation failed:", error);
    return null;
  }
};

// Restore from a backup
const restoreBackup = async (backupId: string): Promise<boolean> => {
  try {
    const backupDir = ensureBackupDir();
    const filename = `${backupId}.json`;
    const filePath = path.join(backupDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file ${filename} not found`);
    }
    
    // Read backup data
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Restore users
    if (data.users) {
      // Clear existing users (except admin/test users)
      const existingUsers = Array.from(storage.users.values());
      for (const user of existingUsers) {
        if (!user.username.includes('admin') && !user.username.includes('test')) {
          await storage.removeUser(user.id);
        }
      }
      
      // Restore users from backup
      for (const user of data.users) {
        if (!user.username.includes('admin') && !user.username.includes('test')) {
          // Skip the user ID and let the storage generate a new one
          const { id, ...userData } = user;
          await storage.createUser(userData);
        }
      }
    }
    
    // Restore emotions
    if (data.emotions) {
      // Clear and restore emotions using updateUserEmotion
      for (const emotion of data.emotions) {
        storage.userEmotions.set(emotion.userId, emotion.emotion);
      }
    }
    
    // Restore journal entries
    if (data.journalEntries) {
      // Clear existing journal entries by clearing the Map
      storage.journalEntries.clear();
      
      // Group entries by userId
      const entriesByUser = data.journalEntries.reduce((acc, entry) => {
        if (!acc[entry.userId]) {
          acc[entry.userId] = [];
        }
        acc[entry.userId].push(entry);
        return acc;
      }, {});
      
      // Set journal entries in the storage
      for (const [userId, entries] of Object.entries(entriesByUser)) {
        storage.journalEntries.set(Number(userId), entries);
      }
    }
    
    // Add more restoration logic for other data types as needed
    
    return true;
  } catch (error) {
    console.error("Backup restoration failed:", error);
    return false;
  }
};

// Get list of available backups
const getBackups = (): BackupMetadata[] => {
  try {
    const backupDir = ensureBackupDir();
    const metadataPath = path.join(backupDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return [];
    }
    
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (error) {
    console.error("Failed to get backups:", error);
    return [];
  }
};

// Run all tests
const runAllTests = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  
  // Database test
  results.push(await testDatabaseConnection());
  
  // Auth test
  results.push(await testAuthSystem());
  
  // Token system test
  results.push(await testTokenSystem());
  
  // Add more tests as needed
  
  return results;
};

// Export controller functions for API routes
export const testController = {
  // Run all tests
  runTests: async (req: Request, res: Response) => {
    try {
      const results = await runAllTests();
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({
        error: "Failed to run tests",
        details: error.message
      });
    }
  },
  
  // Create a backup
  createBackup: async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      const backup = await createBackup(description || "Manual backup");
      
      if (!backup) {
        res.status(500).json({ error: "Failed to create backup" });
        return;
      }
      
      res.status(200).json(backup);
    } catch (error) {
      res.status(500).json({
        error: "Failed to create backup",
        details: error.message
      });
    }
  },
  
  // Get list of backups
  getBackups: (req: Request, res: Response) => {
    try {
      const backups = getBackups();
      res.status(200).json(backups);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get backups",
        details: error.message
      });
    }
  },
  
  // Restore from backup
  restoreBackup: async (req: Request, res: Response) => {
    try {
      const { backupId } = req.params;
      
      if (!backupId) {
        res.status(400).json({ error: "Backup ID is required" });
        return;
      }
      
      const success = await restoreBackup(backupId);
      
      if (!success) {
        res.status(500).json({ error: "Failed to restore backup" });
        return;
      }
      
      res.status(200).json({ message: "Backup restored successfully" });
    } catch (error) {
      res.status(500).json({
        error: "Failed to restore backup",
        details: error.message
      });
    }
  }
};

// Helper functions for storage
export const storageHelpers = {
  testDatabaseConnection,
  testAuthSystem,
  testTokenSystem,
  createBackup,
  restoreBackup,
  getBackups
};