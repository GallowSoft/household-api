import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Store } from './store.type';
import { ShoppingListItem } from './shopping-list-item.type';

@ObjectType()
export class ShoppingList {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => Store, { nullable: true })
  store?: Store;

  @Field(() => [ShoppingListItem], { nullable: true })
  items?: ShoppingListItem[];

  @Field(() => Number, { nullable: true, description: 'Total items in this list' })
  itemsCount?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ID, { nullable: true })
  createdBy?: string;

  @Field(() => ID, { nullable: true })
  updatedBy?: string;
}

