# Household Inventory Database Schema

This database schema is designed for managing household inventory items, tracking quantities, and comparing prices across different stores.

## Tables Overview

### 1. `stores`
Stores information about different retail locations where you shop.

**Key Fields:**
- `name`: Store name (e.g., "Walmart Supercenter")
- `address`: Physical address
- `phone`: Contact number
- `website`: Store website URL
- `is_active`: Whether the store is currently being used

### 2. `inventory_items`
Core table containing all household items you want to track.

**Key Fields:**
- `name`: Item name (e.g., "Milk", "Bread")
- `description`: Detailed description
- `category`: Item category (e.g., "Dairy", "Produce", "Meat")
- `brand`: Brand name
- `barcode`: Product barcode (unique)
- `unit_of_measure`: How the item is measured (e.g., "gallon", "lb", "each")
- `current_quantity`: How much you currently have
- `minimum_quantity`: Minimum stock level before adding to shopping list
- `maximum_quantity`: Maximum stock level
- `storage_location`: Where items are stored (e.g., "refrigerator", "pantry")

### 3. `shopping_list`
Items that need to be purchased.

**Key Fields:**
- `inventory_item_id`: Reference to the item
- `quantity_needed`: How much to buy
- `priority`: Shopping priority (1=low, 2=medium, 3=high)
- `notes`: Additional notes
- `is_purchased`: Whether the item has been bought

### 4. `item_prices`
Tracks prices for items at different stores.

**Key Fields:**
- `inventory_item_id`: Reference to the item
- `store_id`: Reference to the store
- `price`: Current price
- `is_current`: Whether this is the most recent price
- `last_updated`: When the price was last updated

## Key Features

### Automatic Shopping List Management
- Items are automatically added to the shopping list when `current_quantity` falls below `minimum_quantity`
- This happens via database triggers, so it's automatic

### Price Tracking
- Only one "current" price per item per store is maintained
- Historical prices are preserved when new prices are added
- Easy to compare prices across stores

### Data Integrity
- Foreign key constraints ensure data consistency
- Unique constraints prevent duplicate entries
- Automatic timestamp updates for tracking changes

## Common Queries

### Get all items currently on shopping list
```sql
SELECT 
    ii.name,
    ii.category,
    sl.quantity_needed,
    sl.priority,
    sl.notes
FROM shopping_list sl
JOIN inventory_items ii ON sl.inventory_item_id = ii.id
WHERE sl.is_purchased = false
ORDER BY sl.priority DESC, ii.name;
```

### Find cheapest store for shopping list items
```sql
SELECT 
    ii.name,
    s.name as store_name,
    ip.price,
    sl.quantity_needed,
    (ip.price * sl.quantity_needed) as total_cost
FROM shopping_list sl
JOIN inventory_items ii ON sl.inventory_item_id = ii.id
JOIN item_prices ip ON ii.id = ip.inventory_item_id
JOIN stores s ON ip.store_id = s.id
WHERE sl.is_purchased = false 
AND ip.is_current = true
ORDER BY ii.name, ip.price;
```

### Check low inventory items
```sql
SELECT 
    name,
    category,
    current_quantity,
    minimum_quantity,
    storage_location
FROM inventory_items
WHERE current_quantity < minimum_quantity
AND is_active = true
ORDER BY category, name;
```

### Update inventory after shopping
```sql
-- Mark items as purchased
UPDATE shopping_list 
SET is_purchased = true, purchased_at = NOW()
WHERE inventory_item_id = 'item-uuid-here';

-- Update current quantity
UPDATE inventory_items 
SET current_quantity = current_quantity + 2.0
WHERE id = 'item-uuid-here';
```

## Getting Started

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Apply migrations:**
   ```bash
   supabase db reset
   ```

3. **Access Supabase Studio:**
   Open http://localhost:54323 to view and manage your data

4. **Add your first items:**
   - Start by adding stores you shop at
   - Add inventory items you want to track
   - Set minimum quantities for automatic shopping list management
   - Add current prices at different stores

## Tips for Effective Use

1. **Set realistic minimum quantities** - This determines when items are automatically added to your shopping list
2. **Update prices regularly** - Add new prices when you shop to keep comparisons accurate
3. **Use categories** - Group similar items for easier management
4. **Track storage locations** - Helps with organization and finding items
5. **Use notes** - Add context to shopping list items (e.g., "for dinner party")
