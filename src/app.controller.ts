import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('supabase-test')
  async testSupabaseConnection() {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
      
      if (error) {
        return {
          success: false,
          error: error.message,
          message: 'Supabase connection failed'
        };
      }
      
      return {
        success: true,
        message: 'Supabase connection successful',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Supabase connection test failed'
      };
    }
  }
}
