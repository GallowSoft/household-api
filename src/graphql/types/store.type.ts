import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Store {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => ID, { nullable: true })
  createdBy?: string;

  @Field(() => ID, { nullable: true })
  updatedBy?: string;

}
