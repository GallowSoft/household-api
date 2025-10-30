import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { InventoryItem } from './inventory-item.type';
import { ShoppingList } from './shopping-list.type';

@ObjectType()
export class ShoppingListItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  shoppingListId?: string;

  @Field(() => ShoppingList, { nullable: true })
  shoppingList?: ShoppingList;

  @Field(() => ID)
  inventoryItemId: string;

  @Field(() => Float)
  quantityNeeded: number;

  @Field(() => Int)
  priority: number;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  isPurchased?: boolean;

  @Field({ nullable: true })
  purchasedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => InventoryItem, { nullable: true })
  inventoryItem?: InventoryItem;

  @Field(() => ID, { nullable: true })
  createdBy?: string;

  @Field(() => ID, { nullable: true })
  updatedBy?: string;

  @Field(() => ID, { nullable: true })
  purchasedBy?: string;
}
