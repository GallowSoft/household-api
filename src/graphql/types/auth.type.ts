import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;

  @Field({ nullable: true })
  lastSignInAt?: string;

  @Field({ nullable: true })
  emailConfirmedAt?: string;

  @Field({ nullable: true })
  phoneConfirmedAt?: string;
}

@ObjectType()
export class AuthSession {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  expiresIn: number;

  @Field()
  tokenType: string;

  @Field(() => AuthUser)
  user: AuthUser;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  refreshToken: string;
}
