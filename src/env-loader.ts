// Load environment variables before any modules are imported
import * as dotenv from 'dotenv';
import * as path from 'path';

// Determine which environment file to load
const envFile =
  process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

// Load the environment file
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`Warning: Could not load ${envFile}:`, result.error.message);
  console.log('Falling back to default .env file...');
  dotenv.config(); // Try default .env
} else {
  console.log(`✅ Loaded environment from: ${envFile}`);
}
