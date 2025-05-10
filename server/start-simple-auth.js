/**
 * This script starts the simplified authentication server for MoodLync
 */

import('ts-node').then(() => {
  import('ts-node/register').then(() => {
    import('./simple-index.ts').catch(error => {
      console.error('Error starting simplified server:', error);
      process.exit(1);
    });
  });
});