// Environment configuration
const isLocal = process.env.NODE_ENV === 'local' || process.env.USE_LOCAL_SUPABASE === 'true';

export const environment = {
  supabase: {
    url: isLocal 
      ? 'http://localhost:54321'
      : process.env.SUPABASE_URL || 'https://wrdcxzxuztcsonulcbkm.supabase.co',
    anonKey: isLocal
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZGN4enh1enRjc29udWxjYmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTI0NjUsImV4cCI6MjA3NTI4ODQ2NX0.f8mjLplnB2a7_-_Dt7THXla5Z6oDjtTGcMMfGjEilhk'
      : process.env.SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZGN4enh1enRjc29udWxjYmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTI0NjUsImV4cCI6MjA3NTI4ODQ2NX0.f8mjLplnB2a7_-_Dt7THXla5Z6oDjtTGcMMfGjEilhk',
    serviceRoleKey: isLocal
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZGN4enh1enRjc29udWxjYmttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxMjQ2NSwiZXhwIjoyMDc1Mjg4NDY1fQ.example_service_key'
      : process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  isLocal,
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};
