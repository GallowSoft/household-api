import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabase.url;
    const supabaseKey =
      environment.supabase.serviceRoleKey || environment.supabase.anonKey;

    if (!supabaseKey) {
      throw new Error(
        'Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in your environment variables.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper method to get the database connection for raw SQL queries
  async query(sql: string, params?: any[]) {
    const { data, error } = await this.supabase.rpc('exec_sql', {
      sql,
      params: params || [],
    });

    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    return data;
  }
}
