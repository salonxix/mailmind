// Test setup - load environment variables
import { config } from 'dotenv';
import path from 'path';

// Load .env.local for tests
config({ path: path.resolve(__dirname, '../.env.local') });

// Verify required env vars
if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY not found in environment');
}
