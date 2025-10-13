import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { InventoryItem } from './inventory-item.type';
import { Store } from './store.type';

@ObjectType()
export class ItemPrice {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  inventoryItemId: string;

  @Field(() => ID)
  storeId: string;

  @Field(() => Float)
  price: number;

  @Field()
  unitOfMeasure: string;

  @Field()
  isCurrent: boolean;

  @Field()
  lastUpdated: Date;

  @Field()
  createdAt: Date;

  @Field(() => InventoryItem, { nullable: true })
  inventoryItem?: InventoryItem;

  @Field(() => Store, { nullable: true })
  store?: Store;
}
