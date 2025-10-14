// Environment configuration
const isLocal = process.env.NODE_ENV === 'local' || process.env.USE_LOCAL_SUPABASE === 'true';

export const environment = {
  supabase: {
    url: isLocal 
      ? 'http://localhost:54321'
      : process.env.SUPABASE_URL || 'https://wrdcxzxuztcsonulcbkm.supabase.co',
    anonKey: isLocal
      ? process.env.SUPABASE_ANON_KEY || 'your_local_anon_key'
      : process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: isLocal
      ? process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_local_service_role_key'
      : process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  isLocal,
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};
