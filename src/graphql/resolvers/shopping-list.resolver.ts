import { Resolver, Query, Args, ID, Float, Int, Mutation, InputType, Field } from '@nestjs/graphql';
import { Injectable, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ShoppingListItem, InventoryItem } from '../types';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { User } from '@supabase/supabase-js';

@InputType()
export class CreateShoppingListItemInput {
  @Field(() => ID)
  inventoryItemId: string;

  @Field(() => Float)
  quantityNeeded: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateShoppingListItemInput {
  @Field(() => ID)
  id: string;

  @Field(() => Float, { nullable: true })
  quantityNeeded?: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  isPurchased?: boolean;
}

@InputType()
export class MarkPurchasedInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  notes?: string;
}

@Injectable()
@Resolver(() => ShoppingListItem)
export class ShoppingListResolver {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Query(() => [ShoppingListItem])
  async shoppingList(
    @Args('isPurchased', { nullable: true }) isPurchased?: boolean,
    @Args('priority', { nullable: true }) priority?: number,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `);
    
    if (isPurchased !== undefined) {
      query = query.eq('is_purchased', isPurchased);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    const { data, error } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true }) as { data: any; error: any };
    
    if (error) {
      throw new Error(`Failed to fetch shopping list: ${error.message}`);
    }
    
    return data?.map((item: any) => ({
      ...item,
      inventoryItem: item.inventory_item,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      purchasedBy: item.purchased_by,
    })) || [];
  }

  @Query(() => ShoppingListItem, { nullable: true })
  async shoppingListItem(@Args('id', { type: () => ID }) id: string): Promise<ShoppingListItem | null> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .eq('id', id)
      .single() as { data: any; error: any };
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch shopping list item: ${error.message}`);
    }
    
    return {
      ...data,
      inventoryItem: data.inventory_item,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      purchasedBy: data.purchased_by,
      creator: data.creator,
      updater: data.updater,
      purchaser: data.purchaser,
    };
  }

  @Query(() => [ShoppingListItem])
  async activeShoppingList(): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .eq('is_purchased', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch active shopping list: ${error.message}`);
    }
    
    return data?.map((item: any) => ({
      ...item,
      inventoryItem: item.inventory_item,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      purchasedBy: item.purchased_by,
    })) || [];
  }

  @Query(() => [ShoppingListItem])
  async highPriorityShoppingList(): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .eq('is_purchased', false)
      .eq('priority', 3)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch high priority shopping list: ${error.message}`);
    }
    
    return data?.map((item: any) => ({
      ...item,
      inventoryItem: item.inventory_item,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      purchasedBy: item.purchased_by,
    })) || [];
  }

  @Mutation(() => ShoppingListItem)
  @UseGuards(SupabaseAuthGuard)
  async createShoppingListItem(
    @Args('input') input: CreateShoppingListItemInput,
    @CurrentUser() user: User,
  ): Promise<ShoppingListItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shopping_list')
      .insert({
        inventory_item_id: input.inventoryItemId,
        quantity_needed: input.quantityNeeded,
        priority: input.priority || 1,
        notes: input.notes,
        is_purchased: false,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .single() as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to create shopping list item: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      purchasedBy: data.purchased_by,
      creator: data.creator,
      updater: data.updater,
      purchaser: data.purchaser,
    };
  }

  @Mutation(() => ShoppingListItem)
  @UseGuards(SupabaseAuthGuard)
  async updateShoppingListItem(
    @Args('input') input: UpdateShoppingListItemInput,
    @CurrentUser() user: User,
  ): Promise<ShoppingListItem> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {
      updated_by: user.id,
    };

    if (input.quantityNeeded !== undefined) updateData.quantity_needed = input.quantityNeeded;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.isPurchased !== undefined) {
      updateData.is_purchased = input.isPurchased;
      if (input.isPurchased) {
        updateData.purchased_at = new Date().toISOString();
        updateData.purchased_by = user.id;
      }
    }

    const { data, error } = await supabase
      .from('shopping_list')
      .update(updateData)
      .eq('id', input.id)
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .single() as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to update shopping list item: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      purchasedBy: data.purchased_by,
      creator: data.creator,
      updater: data.updater,
      purchaser: data.purchaser,
    };
  }

  @Mutation(() => ShoppingListItem)
  @UseGuards(SupabaseAuthGuard)
  async markPurchased(
    @Args('input') input: MarkPurchasedInput,
    @CurrentUser() user: User,
  ): Promise<ShoppingListItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shopping_list')
      .update({
        is_purchased: true,
        purchased_at: new Date().toISOString(),
        purchased_by: user.id,
        updated_by: user.id,
        notes: input.notes,
      })
      .eq('id', input.id)
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .single() as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to mark item as purchased: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      purchasedBy: data.purchased_by,
      creator: data.creator,
      updater: data.updater,
      purchaser: data.purchaser,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(SupabaseAuthGuard)
  async deleteShoppingListItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete shopping list item: ${error.message}`);
    }

    return true;
  }

  @Query(() => [ShoppingListItem])
  @UseGuards(SupabaseAuthGuard)
  async myShoppingList(
    @CurrentUser() user: User,
    @Args('isPurchased', { nullable: true }) isPurchased?: boolean,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .eq('created_by', user.id);
    
    if (isPurchased !== undefined) {
      query = query.eq('is_purchased', isPurchased);
    }
    
    const { data, error } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true }) as { data: any; error: any };
    
    if (error) {
      throw new Error(`Failed to fetch my shopping list: ${error.message}`);
    }
    
    return data?.map((item: any) => ({
      ...item,
      inventoryItem: item.inventory_item,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      purchasedBy: item.purchased_by,
    })) || [];
  }

  @Query(() => [ShoppingListItem])
  @UseGuards(SupabaseAuthGuard)
  async myPurchasedItems(
    @CurrentUser() user: User,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit?: number,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .eq('purchased_by', user.id)
      .order('purchased_at', { ascending: false })
      .limit(limit || 20) as { data: any; error: any };
    
    if (error) {
      throw new Error(`Failed to fetch my purchased items: ${error.message}`);
    }
    
    return data?.map((item: any) => ({
      ...item,
      inventoryItem: item.inventory_item,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      purchasedBy: item.purchased_by,
    })) || [];
  }

  @Query(() => [ShoppingListItem])
  @UseGuards(SupabaseAuthGuard)
  async recentlyAddedItems(
    @CurrentUser() user: User,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit?: number,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        inventory_item:inventory_items(*),
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(limit || 10) as { data: any; error: any };
    
    if (error) {
      throw new Error(`Failed to fetch recently added items: ${error.message}`);
    }
    
    return data?.map((item: any) => ({
      ...item,
      inventoryItem: item.inventory_item,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      purchasedBy: item.purchased_by,
    })) || [];
  }
}
