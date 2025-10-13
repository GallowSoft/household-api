import { Resolver, Query, Args, ID, Float, Mutation, InputType, Field } from '@nestjs/graphql';
import { Injectable, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { InventoryItem } from '../types';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { User } from '@supabase/supabase-js';

@InputType()
export class CreateInventoryItemInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  unitOfMeasure?: string;

  @Field(() => Float, { nullable: true })
  currentQuantity?: number;

  @Field(() => Float, { nullable: true })
  minimumQuantity?: number;

  @Field(() => Float, { nullable: true })
  maximumQuantity?: number;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field(() => Float, { nullable: true })
  costPerUnit?: number;

  @Field({ nullable: true })
  storageLocation?: string;
}

@InputType()
export class UpdateInventoryItemInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  unitOfMeasure?: string;

  @Field(() => Float, { nullable: true })
  currentQuantity?: number;

  @Field(() => Float, { nullable: true })
  minimumQuantity?: number;

  @Field(() => Float, { nullable: true })
  maximumQuantity?: number;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field(() => Float, { nullable: true })
  costPerUnit?: number;

  @Field({ nullable: true })
  storageLocation?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@Injectable()
@Resolver(() => InventoryItem)
export class InventoryItemsResolver {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Query(() => [InventoryItem])
  async inventoryItems(
    @Args('category', { nullable: true }) category?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
    @Args('lowStock', { nullable: true }) lowStock?: boolean,
  ): Promise<InventoryItem[]> {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase.from('inventory_items').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      throw new Error(`Failed to fetch inventory items: ${error.message}`);
    }
    
    let result = data || [];
    
    // Filter low stock items in application layer if requested
    if (lowStock) {
      result = result.filter(item => item.current_quantity < item.minimum_quantity);
    }
    
    return result.map(item => ({
      ...item,
      unitOfMeasure: item.unit_of_measure,
      currentQuantity: item.current_quantity,
      minimumQuantity: item.minimum_quantity,
      maximumQuantity: item.maximum_quantity,
      expirationDate: item.expiration_date,
      purchaseDate: item.purchase_date,
      costPerUnit: item.cost_per_unit,
      storageLocation: item.storage_location,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }));
  }

  @Query(() => InventoryItem, { nullable: true })
  async inventoryItem(@Args('id', { type: () => ID }) id: string): Promise<InventoryItem | null> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch inventory item: ${error.message}`);
    }
    
    return data ? {
      ...data,
      unitOfMeasure: data.unit_of_measure,
      currentQuantity: data.current_quantity,
      minimumQuantity: data.minimum_quantity,
      maximumQuantity: data.maximum_quantity,
      expirationDate: data.expiration_date,
      purchaseDate: data.purchase_date,
      costPerUnit: data.cost_per_unit,
      storageLocation: data.storage_location,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    } : null;
  }

  @Query(() => [InventoryItem])
  async inventoryItemsByCategory(@Args('category') category: string): Promise<InventoryItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        creator:created_by(id, email),
        updater:updated_by(id, email)
      `)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch inventory items by category: ${error.message}`);
    }
    
    return (data || []).map(item => ({
      ...item,
      unitOfMeasure: item.unit_of_measure,
      currentQuantity: item.current_quantity,
      minimumQuantity: item.minimum_quantity,
      maximumQuantity: item.maximum_quantity,
      expirationDate: item.expiration_date,
      purchaseDate: item.purchase_date,
      costPerUnit: item.cost_per_unit,
      storageLocation: item.storage_location,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }));
  }

  @Query(() => [InventoryItem])
  async lowStockItems(): Promise<InventoryItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        creator:created_by(id, email),
        updater:updated_by(id, email)
      `)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch low stock items: ${error.message}`);
    }
    
    // Filter for low stock items in application layer
    const lowStockItems = (data || []).filter(item => item.current_quantity < item.minimum_quantity);
    
    return lowStockItems.map(item => ({
      ...item,
      unitOfMeasure: item.unit_of_measure,
      currentQuantity: item.current_quantity,
      minimumQuantity: item.minimum_quantity,
      maximumQuantity: item.maximum_quantity,
      expirationDate: item.expiration_date,
      purchaseDate: item.purchase_date,
      costPerUnit: item.cost_per_unit,
      storageLocation: item.storage_location,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }));
  }

  @Mutation(() => InventoryItem)
  @UseGuards(SupabaseAuthGuard)
  async createInventoryItem(
    @Args('input') input: CreateInventoryItemInput,
    @CurrentUser() user: User,
  ): Promise<InventoryItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name: input.name,
        description: input.description,
        category: input.category,
        brand: input.brand,
        barcode: input.barcode,
        unit_of_measure: input.unitOfMeasure || 'each',
        current_quantity: input.currentQuantity || 0,
        minimum_quantity: input.minimumQuantity || 0,
        maximum_quantity: input.maximumQuantity,
        expiration_date: input.expirationDate,
        purchase_date: input.purchaseDate,
        cost_per_unit: input.costPerUnit,
        storage_location: input.storageLocation,
        is_active: true,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inventory item: ${error.message}`);
    }

    return {
      ...data,
      unitOfMeasure: data.unit_of_measure,
      currentQuantity: data.current_quantity,
      minimumQuantity: data.minimum_quantity,
      maximumQuantity: data.maximum_quantity,
      expirationDate: data.expiration_date,
      purchaseDate: data.purchase_date,
      costPerUnit: data.cost_per_unit,
      storageLocation: data.storage_location,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  @Mutation(() => InventoryItem)
  @UseGuards(SupabaseAuthGuard)
  async updateInventoryItem(
    @Args('input') input: UpdateInventoryItemInput,
    @CurrentUser() user: User,
  ): Promise<InventoryItem> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {
      updated_by: user.id,
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;
    if (input.unitOfMeasure !== undefined) updateData.unit_of_measure = input.unitOfMeasure;
    if (input.currentQuantity !== undefined) updateData.current_quantity = input.currentQuantity;
    if (input.minimumQuantity !== undefined) updateData.minimum_quantity = input.minimumQuantity;
    if (input.maximumQuantity !== undefined) updateData.maximum_quantity = input.maximumQuantity;
    if (input.expirationDate !== undefined) updateData.expiration_date = input.expirationDate;
    if (input.purchaseDate !== undefined) updateData.purchase_date = input.purchaseDate;
    if (input.costPerUnit !== undefined) updateData.cost_per_unit = input.costPerUnit;
    if (input.storageLocation !== undefined) updateData.storage_location = input.storageLocation;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update inventory item: ${error.message}`);
    }

    return {
      ...data,
      unitOfMeasure: data.unit_of_measure,
      currentQuantity: data.current_quantity,
      minimumQuantity: data.minimum_quantity,
      maximumQuantity: data.maximum_quantity,
      expirationDate: data.expiration_date,
      purchaseDate: data.purchase_date,
      costPerUnit: data.cost_per_unit,
      storageLocation: data.storage_location,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(SupabaseAuthGuard)
  async deleteInventoryItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('inventory_items')
      .update({ 
        is_active: false,
        updated_by: user.id,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete inventory item: ${error.message}`);
    }

    return true;
  }

  @Query(() => [InventoryItem])
  @UseGuards(SupabaseAuthGuard)
  async myInventoryItems(
    @CurrentUser() user: User,
    @Args('category', { nullable: true }) category?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<InventoryItem[]> {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase.from('inventory_items').select(`
      *,
    `).eq('created_by', user.id);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      throw new Error(`Failed to fetch my inventory items: ${error.message}`);
    }
    
    return (data || []).map(item => ({
      ...item,
      unitOfMeasure: item.unit_of_measure,
      currentQuantity: item.current_quantity,
      minimumQuantity: item.minimum_quantity,
      maximumQuantity: item.maximum_quantity,
      expirationDate: item.expiration_date,
      purchaseDate: item.purchase_date,
      costPerUnit: item.cost_per_unit,
      storageLocation: item.storage_location,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }));
  }

  @Query(() => [InventoryItem])
  @UseGuards(SupabaseAuthGuard)
  async recentlyUpdatedItems(
    @CurrentUser() user: User,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit?: number,
  ): Promise<InventoryItem[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        creator:created_by(id, email),
        updater:updated_by(id, email)
      `)
      .eq('updated_by', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit || 10);
    
    if (error) {
      throw new Error(`Failed to fetch recently updated items: ${error.message}`);
    }
    
    return (data || []).map(item => ({
      ...item,
      unitOfMeasure: item.unit_of_measure,
      currentQuantity: item.current_quantity,
      minimumQuantity: item.minimum_quantity,
      maximumQuantity: item.maximum_quantity,
      expirationDate: item.expiration_date,
      purchaseDate: item.purchase_date,
      costPerUnit: item.cost_per_unit,
      storageLocation: item.storage_location,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }));
  }
}
