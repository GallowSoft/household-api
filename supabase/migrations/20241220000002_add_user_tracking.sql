-- Add user tracking to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user tracking to shopping_list table
ALTER TABLE shopping_list 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN purchased_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user tracking to stores table
ALTER TABLE stores 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user tracking to item_prices table
ALTER TABLE item_prices 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for better performance on user tracking columns
CREATE INDEX idx_inventory_items_created_by ON inventory_items(created_by);
CREATE INDEX idx_inventory_items_updated_by ON inventory_items(updated_by);
CREATE INDEX idx_shopping_list_created_by ON shopping_list(created_by);
CREATE INDEX idx_shopping_list_updated_by ON shopping_list(updated_by);
CREATE INDEX idx_shopping_list_purchased_by ON shopping_list(purchased_by);
CREATE INDEX idx_stores_created_by ON stores(created_by);
CREATE INDEX idx_stores_updated_by ON stores(updated_by);
CREATE INDEX idx_item_prices_created_by ON item_prices(created_by);
CREATE INDEX idx_item_prices_updated_by ON item_prices(updated_by);

-- Update the trigger function to handle user tracking
CREATE OR REPLACE FUNCTION update_updated_at_and_user_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- If updated_by is not set, keep the existing value
    -- This allows manual setting of updated_by in application code
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update existing triggers to use the new function
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS update_shopping_list_updated_at ON shopping_list;
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
DROP TRIGGER IF EXISTS update_item_prices_updated_at ON item_prices;

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_and_user_column();

CREATE TRIGGER update_shopping_list_updated_at BEFORE UPDATE ON shopping_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_and_user_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_and_user_column();

CREATE TRIGGER update_item_prices_updated_at BEFORE UPDATE ON item_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_and_user_column();

