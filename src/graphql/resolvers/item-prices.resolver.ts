import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ItemPrice } from '../types';

@Injectable()
@Resolver(() => ItemPrice)
export class ItemPricesResolver {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Query(() => [ItemPrice])
  async itemPrices(
    @Args('inventoryItemId', { type: () => ID, nullable: true })
    inventoryItemId?: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('isCurrent', { nullable: true }) isCurrent?: boolean,
  ): Promise<ItemPrice[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('item_prices').select(`
        *,
        inventory_item:inventory_items(*),
        store:stores(*)
      `);

    if (inventoryItemId) {
      query = query.eq('inventory_item_id', inventoryItemId);
    }

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (isCurrent !== undefined) {
      query = query.eq('is_current', isCurrent);
    }

    const { data, error } = await query.order('last_updated', {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch item prices: ${error.message}`);
    }

    return (data?.map((price: any) => ({
      id: price.id,
      inventoryItemId: price.inventory_item_id,
      storeId: price.store_id,
      price: price.price,
      unitOfMeasure: price.unit_of_measure,
      isCurrent: price.is_current,
      lastUpdated: price.last_updated,
      createdAt: price.created_at,
      inventoryItem: price.inventory_item,
      store: price.store,
    })) || []) as ItemPrice[];
  }

  @Query(() => ItemPrice, { nullable: true })
  async itemPrice(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ItemPrice | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('item_prices')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        store:stores(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch item price: ${error.message}`);
    }

    return {
      id: data.id,
      inventoryItemId: data.inventory_item_id,
      storeId: data.store_id,
      price: data.price,
      unitOfMeasure: data.unit_of_measure,
      isCurrent: data.is_current,
      lastUpdated: data.last_updated,
      createdAt: data.created_at,
      inventoryItem: data.inventory_item,
      store: data.store,
    } as ItemPrice;
  }

  @Query(() => [ItemPrice])
  async currentPricesForItem(
    @Args('inventoryItemId', { type: () => ID }) inventoryItemId: string,
  ): Promise<ItemPrice[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('item_prices')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        store:stores(*)
      `,
      )
      .eq('inventory_item_id', inventoryItemId)
      .eq('is_current', true)
      .order('price', { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch current prices for item: ${error.message}`,
      );
    }

    return (data?.map((price: any) => ({
      id: price.id,
      inventoryItemId: price.inventory_item_id,
      storeId: price.store_id,
      price: price.price,
      unitOfMeasure: price.unit_of_measure,
      isCurrent: price.is_current,
      lastUpdated: price.last_updated,
      createdAt: price.created_at,
      inventoryItem: price.inventory_item,
      store: price.store,
    })) || []) as ItemPrice[];
  }

  @Query(() => [ItemPrice])
  async cheapestPricesForShoppingList(): Promise<ItemPrice[]> {
    const supabase = this.supabaseService.getClient();

    // This query finds the cheapest current price for each item on the shopping list
    const { data, error } = await supabase
      .from('shopping_list')
      .select(
        `
        inventory_item_id,
        quantity_needed,
        inventory_item:inventory_items(*)
      `,
      )
      .eq('is_purchased', false);

    if (error) {
      throw new Error(
        `Failed to fetch shopping list for price comparison: ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      return [];
    }

    // For each item, get the cheapest current price
    const cheapestPrices: ItemPrice[] = [];

    for (const item of data) {
      const { data: prices, error: priceError } = await supabase
        .from('item_prices')
        .select(
          `
          *,
          inventory_item:inventory_items(*),
          store:stores(*)
        `,
        )
        .eq('inventory_item_id', item.inventory_item_id)
        .eq('is_current', true)
        .order('price', { ascending: true })
        .limit(1);

      if (priceError) {
        console.error(
          `Failed to fetch prices for item ${item.inventory_item_id}:`,
          priceError,
        );
        continue;
      }

      if (prices && prices.length > 0) {
        const price = prices[0];
        cheapestPrices.push({
          id: price.id,
          inventoryItemId: price.inventory_item_id,
          storeId: price.store_id,
          price: price.price,
          unitOfMeasure: price.unit_of_measure,
          isCurrent: price.is_current,
          lastUpdated: price.last_updated,
          createdAt: price.created_at,
          inventoryItem: price.inventory_item,
          store: price.store,
        } as ItemPrice);
      }
    }

    return cheapestPrices;
  }
}
