import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import {
  StoresResolver,
  InventoryItemsResolver,
  ShoppingListResolver,
  ItemPricesResolver,
} from './graphql/resolvers';
import { AuthResolver } from './auth/auth.resolver';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    SupabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    StoresResolver,
    InventoryItemsResolver,
    ShoppingListResolver,
    ItemPricesResolver,
    AuthResolver,
    AuthService,
  ],
})
export class AppModule {}
