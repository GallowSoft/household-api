import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthSession, AuthUser, LoginInput, RegisterInput, RefreshTokenInput } from '../graphql/types/auth.type';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(input: LoginInput): Promise<AuthSession> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.session || !data.user) {
      throw new UnauthorizedException('Login failed');
    }

    return this.mapToAuthSession(data.session, data.user);
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      phone: input.phone,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException('Registration failed - no user created');
    }

    // If no session is returned (email confirmation required), create a mock session
    if (!data.session) {
      // Return a session-like object for successful registration without immediate login
      return {
        accessToken: 'pending_confirmation',
        refreshToken: 'pending_confirmation',
        expiresIn: 0,
        tokenType: 'bearer',
        user: this.mapToAuthUser(data.user),
      };
    }

    return this.mapToAuthSession(data.session, data.user);
  }

  async refreshToken(input: RefreshTokenInput): Promise<AuthSession> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: input.refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.session || !data.user) {
      throw new UnauthorizedException('Token refresh failed');
    }

    return this.mapToAuthSession(data.session, data.user);
  }

  async logout(accessToken: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return true;
  }

  async getCurrentUser(accessToken: string): Promise<AuthUser> {
    const supabase = this.supabaseService.getClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.mapToAuthUser(user);
  }

  private mapToAuthSession(session: any, user: any): AuthSession {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      tokenType: session.token_type,
      user: this.mapToAuthUser(user),
    };
  }

  private mapToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      phone: user.phone,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastSignInAt: user.last_sign_in_at,
      emailConfirmedAt: user.email_confirmed_at,
      phoneConfirmedAt: user.phone_confirmed_at,
    };
  }
}
