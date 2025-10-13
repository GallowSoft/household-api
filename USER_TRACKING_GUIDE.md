# User Tracking Guide

This guide explains how to track who has added items to your inventory and shopping list using the new user tracking functionality.

## Overview

The system now tracks:
- **Who created** each inventory item, shopping list item, and store
- **Who last updated** each item
- **Who purchased** shopping list items
- **When** each action occurred

## Database Changes

### New Columns Added

#### Inventory Items (`inventory_items`)
- `created_by` - UUID of user who created the item
- `updated_by` - UUID of user who last updated the item

#### Shopping List (`shopping_list`)
- `created_by` - UUID of user who added the item to shopping list
- `updated_by` - UUID of user who last updated the item
- `purchased_by` - UUID of user who marked the item as purchased

#### Stores (`stores`)
- `created_by` - UUID of user who created the store
- `updated_by` - UUID of user who last updated the store

#### Item Prices (`item_prices`)
- `created_by` - UUID of user who added the price
- `updated_by` - UUID of user who last updated the price

## GraphQL Schema Updates

### New Fields in Types

All types now include user tracking fields:

```graphql
type InventoryItem {
  # ... existing fields ...
  createdBy: ID
  updatedBy: ID
}

type ShoppingListItem {
  # ... existing fields ...
  createdBy: ID
  updatedBy: ID
  purchasedBy: ID
}

type Store {
  # ... existing fields ...
  createdBy: ID
  updatedBy: ID
}
```

## New Mutations

### Inventory Items

#### Create Inventory Item
```graphql
mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
  createInventoryItem(input: $input) {
    id
    name
    createdBy
  }
}
```

#### Update Inventory Item
```graphql
mutation UpdateInventoryItem($input: UpdateInventoryItemInput!) {
  updateInventoryItem(input: $input) {
    id
    name
    updatedBy
  }
}
```

### Shopping List Items

#### Create Shopping List Item
```graphql
mutation CreateShoppingListItem($input: CreateShoppingListItemInput!) {
  createShoppingListItem(input: $input) {
    id
    quantityNeeded
    createdBy
  }
}
```

#### Mark as Purchased
```graphql
mutation MarkPurchased($input: MarkPurchasedInput!) {
  markPurchased(input: $input) {
    id
    isPurchased
    purchasedBy
    purchasedAt
  }
}
```

## New User-Specific Queries

### My Inventory Items
```graphql
query MyInventoryItems($category: String, $isActive: Boolean) {
  myInventoryItems(category: $category, isActive: $isActive) {
    id
    name
    category
    createdBy
  }
}
```

### Recently Updated Items
```graphql
query RecentlyUpdatedItems($limit: Int) {
  recentlyUpdatedItems(limit: $limit) {
    id
    name
    updatedAt
    updatedBy
  }
}
```

### My Shopping List
```graphql
query MyShoppingList($isPurchased: Boolean) {
  myShoppingList(isPurchased: $isPurchased) {
    id
    quantityNeeded
    priority
    createdBy
  }
}
```

### My Purchased Items
```graphql
query MyPurchasedItems($limit: Int) {
  myPurchasedItems(limit: $limit) {
    id
    quantityNeeded
    purchasedAt
    purchasedBy
  }
}
```

### Recently Added Items
```graphql
query RecentlyAddedItems($limit: Int) {
  recentlyAddedItems(limit: $limit) {
    id
    quantityNeeded
    createdAt
    createdBy
  }
}
```

## Usage Examples

### 1. Track Who Added Items

When a user creates an inventory item, the system automatically records their ID:

```graphql
mutation {
  createInventoryItem(input: {
    name: "Milk"
    category: "Dairy"
    currentQuantity: 2
    minimumQuantity: 1
  }) {
    id
    name
    createdBy
    creator {
      email
    }
    createdAt
  }
}
```

### 2. See Who Updated Items

When someone updates an item, the system tracks who made the change:

```graphql
mutation {
  updateInventoryItem(input: {
    id: "item-id"
    currentQuantity: 1
  }) {
    id
    name
    currentQuantity
    updatedBy
    updater {
      email
    }
    updatedAt
  }
}
```

### 3. Track Shopping Activity

See who added items to the shopping list and who purchased them:

```graphql
query {
  shoppingList {
    id
    quantityNeeded
    isPurchased
    createdBy
    creator {
      email
    }
    purchasedBy
    purchaser {
      email
    }
    purchasedAt
  }
}
```

### 4. Get Personal Activity

Users can see their own activity:

```graphql
query {
  myInventoryItems {
    id
    name
    createdAt
  }
  
  myPurchasedItems(limit: 10) {
    id
    quantityNeeded
    purchasedAt
  }
  
  recentlyUpdatedItems(limit: 5) {
    id
    name
    updatedAt
  }
}
```

## Migration

To apply the database changes, run the migration:

```bash
# Apply the migration
supabase db push
```

Or if using the migration file directly:

```sql
-- Run the migration file
\i supabase/migrations/20241220000002_add_user_tracking.sql
```

## Security Notes

1. **Authentication Required**: All mutations require authentication via `@UseGuards(SupabaseAuthGuard)`
2. **User Context**: The `@CurrentUser()` decorator automatically provides the authenticated user
3. **Automatic Tracking**: User IDs are automatically set when creating/updating items
4. **Privacy**: Users can only see their own activity through user-specific queries

## Important Note

The user tracking fields (`createdBy`, `updatedBy`, `purchasedBy`) contain the user IDs from Supabase Auth. To get user details like email or name, you would need to make a separate query to the `auth.users` table or implement a custom resolver that fetches user information.

For example, if you need user details:
```graphql
query {
  inventoryItems {
    id
    name
    createdBy  # This is the user ID
  }
}

# Then separately query user details if needed
query {
  me {
    id
    email
  }
}
```

## Benefits

1. **Accountability**: Know who added what items
2. **Activity Tracking**: See recent changes and purchases
3. **Personal Views**: Users can see their own contributions
4. **Audit Trail**: Complete history of who did what and when
5. **Household Management**: Track contributions from different family members

## Example Use Cases

1. **Family Household**: Track which family member added items to the shopping list
2. **Roommate Management**: See who purchased what items
3. **Inventory Management**: Know who last updated stock levels
4. **Activity Monitoring**: See recent changes and additions
5. **Contribution Tracking**: Monitor who's contributing to household management
