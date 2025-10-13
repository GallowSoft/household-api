import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  InputType,
  Field,
} from '@nestjs/graphql';
import { Injectable, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Store } from '../types';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { User } from '@supabase/supabase-js';

@InputType()
export class CreateStoreInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;
}

@Injectable()
@Resolver(() => Store)
export class StoresResolver {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Query(() => [Store])
  async stores(
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<Store[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('stores').select('*');

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch stores: ${error.message}`);
    }

    return (data || []).map(
      (store: any): Store => ({
        ...store,
        isActive: store.is_active,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
        createdBy: store.created_by,
        updatedBy: store.updated_by,
      }),
    );
  }

  @Query(() => Store, { nullable: true })
  async store(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Store | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch store: ${error.message}`);
    }

    return data
      ? {
          ...data,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          createdBy: data.created_by,
          updatedBy: data.updated_by,
        }
      : null;
  }

  @Mutation(() => Store)
  @UseGuards(SupabaseAuthGuard)
  async createStore(
    @Args('input') input: CreateStoreInput,
    @CurrentUser() user: User,
  ): Promise<Store> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: input.name,
        address: input.address,
        phone: input.phone,
        website: input.website,
        is_active: true,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create store: ${error.message}`);
    }

    return {
      ...data,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }
}
