import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { Injectable, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { CurrentUser } from './current-user.decorator';
import {
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
} from '../graphql/types/auth.type';
import type { User } from '@supabase/supabase-js';

@Injectable()
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthSession)
  async login(@Args('input') input: LoginInput): Promise<AuthSession> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthSession)
  async register(@Args('input') input: RegisterInput): Promise<AuthSession> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthSession)
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
  ): Promise<AuthSession> {
    return this.authService.refreshToken(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(SupabaseAuthGuard)
  async logout(@Context() context: any): Promise<boolean> {
    const authHeader = context.req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token found');
    }

    return this.authService.logout(token);
  }

  @Query(() => AuthUser)
  @UseGuards(SupabaseAuthGuard)
  async me(@CurrentUser() user: User): Promise<AuthUser> {
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
