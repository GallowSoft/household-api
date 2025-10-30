import {
  Resolver,
  Query,
  Args,
  ID,
  Float,
  Int,
  Mutation,
  InputType,
  Field,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Injectable, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ShoppingListItem, ShoppingList } from '../types';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { User } from '@supabase/supabase-js';

@InputType()
export class CreateShoppingListInput {
  @Field()
  name: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;
}

@InputType()
export class UpdateShoppingListInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;
}

@InputType()
export class CreateShoppingListItemInput {
  @Field(() => ID)
  inventoryItemId: string;

  @Field(() => ID, { nullable: true })
  shoppingListId?: string;

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

  // ShoppingList queries
  @Query(() => [ShoppingList])
  @UseGuards(SupabaseAuthGuard)
  async shoppingLists(
    @CurrentUser() user: User,
    @Args('storeId', { nullable: true, type: () => ID }) storeId?: string,
  ): Promise<ShoppingList[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('shopping_lists')
      .select(
        `
        *,
        store:stores(*)
      `,
      )
      .eq('created_by', user.id);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = (await query.order('created_at', {
      ascending: false,
    })) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to fetch shopping lists: ${error.message}`);
    }

    return (
      data?.map((list: any) => ({
        ...list,
        store: list.store,
        createdBy: list.created_by,
        updatedBy: list.updated_by,
      })) || []
    );
  }

  @Query(() => ShoppingList, { nullable: true })
  @UseGuards(SupabaseAuthGuard)
  async shoppingListById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<ShoppingList | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = (await supabase
      .from('shopping_lists')
      .select(
        `
        *,
        store:stores(*),
        items:shopping_list(
          *,
          inventory_item:inventory_items(*)
        )
      `,
      )
      .eq('id', id)
      .eq('created_by', user.id)
      .single()) as { data: any; error: any };

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch shopping list: ${error.message}`);
    }

    return {
      ...data,
      store: data.store,
      items:
        data.items?.map((item: any) => ({
          ...item,
          inventoryItem: item.inventory_item,
          createdBy: item.created_by,
          updatedBy: item.updated_by,
          purchasedBy: item.purchased_by,
          shoppingListId: item.shopping_list_id,
        })) || [],
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  @Mutation(() => ShoppingList)
  @UseGuards(SupabaseAuthGuard)
  async createShoppingList(
    @Args('input') input: CreateShoppingListInput,
    @CurrentUser() user: User,
  ): Promise<ShoppingList> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = (await supabase
      .from('shopping_lists')
      .insert({
        name: input.name,
        store_id: input.storeId || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(
        `
        *,
        store:stores(*)
      `,
      )
      .single()) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to create shopping list: ${error.message}`);
    }

    return {
      ...data,
      store: data.store,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  @Mutation(() => ShoppingList)
  @UseGuards(SupabaseAuthGuard)
  async updateShoppingList(
    @Args('input') input: UpdateShoppingListInput,
    @CurrentUser() user: User,
  ): Promise<ShoppingList> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {
      updated_by: user.id,
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.storeId !== undefined)
      updateData.store_id = input.storeId || null;

    const { data, error } = (await supabase
      .from('shopping_lists')
      .update(updateData)
      .eq('id', input.id)
      .eq('created_by', user.id)
      .select(
        `
        *,
        store:stores(*)
      `,
      )
      .single()) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to update shopping list: ${error.message}`);
    }

    return {
      ...data,
      store: data.store,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(SupabaseAuthGuard)
  async deleteShoppingList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      throw new Error(`Failed to delete shopping list: ${error.message}`);
    }

    return true;
  }

  @Query(() => [ShoppingListItem])
  async shoppingList(
    @Args('isPurchased', { nullable: true }) isPurchased?: boolean,
    @Args('priority', { nullable: true }) priority?: number,
    @Args('shoppingListId', { nullable: true, type: () => ID })
    shoppingListId?: string,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('shopping_list').select(`
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `);

    if (isPurchased !== undefined) {
      query = query.eq('is_purchased', isPurchased);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (shoppingListId) {
      query = query.eq('shopping_list_id', shoppingListId);
    }

    const { data, error } = (await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to fetch shopping list: ${error.message}`);
    }

    return (
      data?.map((item: any) => ({
        ...item,
        inventoryItem: item.inventory_item,
        shoppingListId: item.shopping_list_id,
        shoppingList: item.shopping_list,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        purchasedBy: item.purchased_by,
      })) || []
    );
  }

  @Query(() => ShoppingListItem, { nullable: true })
  async shoppingListItem(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ShoppingListItem | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = (await supabase
      .from('shopping_list')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .eq('id', id)
      .single()) as { data: any; error: any };

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch shopping list item: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      shoppingListId: data.shopping_list_id,
      shoppingList: data.shopping_list,
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
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .eq('is_purchased', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch active shopping list: ${error.message}`);
    }

    return (
      data?.map((item: any) => ({
        ...item,
        inventoryItem: item.inventory_item,
        shoppingListId: item.shopping_list_id,
        shoppingList: item.shopping_list,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        purchasedBy: item.purchased_by,
      })) || []
    );
  }

  @Query(() => [ShoppingListItem])
  async highPriorityShoppingList(): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('shopping_list')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .eq('is_purchased', false)
      .eq('priority', 3)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch high priority shopping list: ${error.message}`,
      );
    }

    return (
      data?.map((item: any) => ({
        ...item,
        inventoryItem: item.inventory_item,
        shoppingListId: item.shopping_list_id,
        shoppingList: item.shopping_list,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        purchasedBy: item.purchased_by,
      })) || []
    );
  }

  @Mutation(() => ShoppingListItem)
  @UseGuards(SupabaseAuthGuard)
  async createShoppingListItem(
    @Args('input') input: CreateShoppingListItemInput,
    @CurrentUser() user: User,
  ): Promise<ShoppingListItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = (await supabase
      .from('shopping_list')
      .insert({
        inventory_item_id: input.inventoryItemId,
        shopping_list_id: input.shoppingListId || null,
        quantity_needed: input.quantityNeeded,
        priority: input.priority || 1,
        notes: input.notes,
        is_purchased: false,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .single()) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to create shopping list item: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      shoppingListId: data.shopping_list_id,
      shoppingList: data.shopping_list,
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

    if (input.quantityNeeded !== undefined)
      updateData.quantity_needed = input.quantityNeeded;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.isPurchased !== undefined) {
      updateData.is_purchased = input.isPurchased;
      if (input.isPurchased) {
        updateData.purchased_at = new Date().toISOString();
        updateData.purchased_by = user.id;
      }
    }

    const { data, error } = (await supabase
      .from('shopping_list')
      .update(updateData)
      .eq('id', input.id)
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .single()) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to update shopping list item: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      shoppingListId: data.shopping_list_id,
      shoppingList: data.shopping_list,
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

    const { data, error } = (await supabase
      .from('shopping_list')
      .update({
        is_purchased: true,
        purchased_at: new Date().toISOString(),
        purchased_by: user.id,
        updated_by: user.id,
        notes: input.notes,
      })
      .eq('id', input.id)
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .single()) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to mark item as purchased: ${error.message}`);
    }

    return {
      ...data,
      inventoryItem: data.inventory_item,
      shoppingListId: data.shopping_list_id,
      shoppingList: data.shopping_list,
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
      .eq('id', id)
      .eq('created_by', user.id);

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
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .eq('created_by', user.id);

    if (isPurchased !== undefined) {
      query = query.eq('is_purchased', isPurchased);
    }

    const { data, error } = (await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to fetch my shopping list: ${error.message}`);
    }

    return (
      data?.map((item: any) => ({
        ...item,
        inventoryItem: item.inventory_item,
        shoppingListId: item.shopping_list_id,
        shoppingList: item.shopping_list,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        purchasedBy: item.purchased_by,
      })) || []
    );
  }

  @Query(() => [ShoppingListItem])
  @UseGuards(SupabaseAuthGuard)
  async myPurchasedItems(
    @CurrentUser() user: User,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit?: number,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = (await supabase
      .from('shopping_list')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .eq('purchased_by', user.id)
      .order('purchased_at', { ascending: false })
      .limit(limit || 20)) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to fetch my purchased items: ${error.message}`);
    }

    return (
      data?.map((item: any) => ({
        ...item,
        inventoryItem: item.inventory_item,
        shoppingListId: item.shopping_list_id,
        shoppingList: item.shopping_list,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        purchasedBy: item.purchased_by,
      })) || []
    );
  }

  @Query(() => [ShoppingListItem])
  @UseGuards(SupabaseAuthGuard)
  async recentlyAddedItems(
    @CurrentUser() user: User,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit?: number,
  ): Promise<ShoppingListItem[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = (await supabase
      .from('shopping_list')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        shopping_list:shopping_lists(*)
      `,
      )
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(limit || 10)) as { data: any; error: any };

    if (error) {
      throw new Error(`Failed to fetch recently added items: ${error.message}`);
    }

    return (
      data?.map((item: any) => ({
        ...item,
        inventoryItem: item.inventory_item,
        shoppingListId: item.shopping_list_id,
        shoppingList: item.shopping_list,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        purchasedBy: item.purchased_by,
      })) || []
    );
  }
}

@Resolver(() => ShoppingList)
export class ShoppingListFieldResolver {
  constructor(private readonly supabaseService: SupabaseService) {}

  @ResolveField(() => Int, { name: 'itemsCount', nullable: true })
  async resolveItemsCount(
    @Parent() list: ShoppingList,
  ): Promise<number | null> {
    const supabase = this.supabaseService.getClient();

    // Use a head count query for efficiency
    const { count, error } = await supabase
      .from('shopping_list')
      .select('id', { count: 'exact', head: true })
      .eq('shopping_list_id', list.id);

    if (error) {
      // Return null to avoid breaking the query if counting fails
      return null;
    }

    return count ?? 0;
  }
}
