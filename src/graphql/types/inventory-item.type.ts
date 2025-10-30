import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class InventoryItem {
  @Field(() => ID)
  id: string;

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

  @Field()
  unitOfMeasure: string;

  @Field(() => Float)
  currentQuantity: number;

  @Field(() => Float)
  minimumQuantity: number;

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ID, { nullable: true })
  createdBy?: string;

  @Field(() => ID, { nullable: true })
  updatedBy?: string;
}
