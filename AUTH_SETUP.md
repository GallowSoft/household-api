# Authentication Setup Guide

This guide explains how to use the Supabase authentication setup in your NestJS GraphQL API.

## Overview

The authentication system includes:
- **SupabaseAuthGuard**: Protects GraphQL resolvers
- **@CurrentUser decorator**: Extracts the authenticated user from context
- **AuthResolver**: Handles login, register, logout, and user info
- **AuthService**: Business logic for authentication operations

## GraphQL Operations

### Authentication Mutations

#### Register a new user
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    expiresIn
    tokenType
    user {
      id
      email
      createdAt
    }
  }
}
```

Variables:
```json
{
  "input": {
    "email": "user@example.com",
    "password": "securepassword123",
    "phone": "+1234567890"
  }
}
```

#### Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    expiresIn
    tokenType
    user {
      id
      email
      createdAt
    }
  }
}
```

Variables:
```json
{
  "input": {
    "email": "user@example.com",
    "password": "securepassword123"
  }
}
```

#### Refresh Token
```graphql
mutation RefreshToken($input: RefreshTokenInput!) {
  refreshToken(input: $input) {
    accessToken
    refreshToken
    expiresIn
    tokenType
    user {
      id
      email
    }
  }
}
```

#### Logout
```graphql
mutation Logout {
  logout
}
```

### Authentication Queries

#### Get Current User
```graphql
query Me {
  me {
    id
    email
    phone
    createdAt
    updatedAt
    lastSignInAt
    emailConfirmedAt
  }
}
```

## Protecting Resolvers

### Using the Auth Guard

To protect a resolver, use the `@UseGuards(SupabaseAuthGuard)` decorator:

```typescript
@Mutation(() => Store)
@UseGuards(SupabaseAuthGuard)
async createStore(
  @Args('input') input: CreateStoreInput,
  @CurrentUser() user: User,
): Promise<Store> {
  // Your protected logic here
  // The user object contains the authenticated user's information
}
```

### Accessing the Current User

Use the `@CurrentUser()` decorator to get the authenticated user:

```typescript
@Query(() => [Store])
@UseGuards(SupabaseAuthGuard)
async myStores(@CurrentUser() user: User): Promise<Store[]> {
  // Filter stores by the current user
  const supabase = this.supabaseService.getClient();
  const { data } = await supabase
    .from('stores')
    .select('*')
    .eq('created_by', user.id);
  
  return data || [];
}
```

## Client-Side Usage

### Setting up the Authorization Header

When making GraphQL requests, include the access token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

fetch('/graphql', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    query: `
      query Me {
        me {
          id
          email
        }
      }
    `
  })
});
```

### Example with Apollo Client

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

## Environment Variables

Make sure you have the following environment variables set:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Schema Considerations

For user-specific data, consider adding a `created_by` or `user_id` column to track ownership:

```sql
ALTER TABLE stores ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE inventory_items ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

## Error Handling

The authentication system will throw the following errors:

- `UnauthorizedException`: When no token is provided or token is invalid
- `BadRequestException`: When registration fails due to validation errors

Handle these errors appropriately in your client application.

## Security Notes

1. **Never expose the service role key** to client-side code
2. **Always validate user permissions** in your resolvers
3. **Use Row Level Security (RLS)** in Supabase for additional database-level protection
4. **Implement proper token refresh logic** in your client application
5. **Store tokens securely** (consider using httpOnly cookies for web apps)
