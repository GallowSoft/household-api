-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    barcode VARCHAR(50) UNIQUE,
    unit_of_measure VARCHAR(20) DEFAULT 'each', -- e.g., 'each', 'kg', 'lb', 'liter', 'gallon'
    current_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0, -- minimum stock level before adding to shopping list
    maximum_quantity DECIMAL(10,2), -- maximum stock level
    expiration_date DATE,
    purchase_date DATE,
    cost_per_unit DECIMAL(10,2),
    storage_location VARCHAR(100), -- e.g., 'pantry', 'refrigerator', 'freezer'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_list table
CREATE TABLE shopping_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_needed DECIMAL(10,2) NOT NULL,
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
    notes TEXT,
    is_purchased BOOLEAN DEFAULT false,
    purchased_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item_prices table to track prices at different stores
CREATE TABLE item_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) DEFAULT 'each',
    is_current BOOLEAN DEFAULT true, -- most recent price for this item at this store
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(inventory_item_id, store_id, is_current) -- ensure only one current price per item per store
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_name ON inventory_items(name);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX idx_inventory_items_current_quantity ON inventory_items(current_quantity);
CREATE INDEX idx_shopping_list_inventory_item_id ON shopping_list(inventory_item_id);
CREATE INDEX idx_shopping_list_is_purchased ON shopping_list(is_purchased);
CREATE INDEX idx_item_prices_inventory_item_id ON item_prices(inventory_item_id);
CREATE INDEX idx_item_prices_store_id ON item_prices(store_id);
CREATE INDEX idx_item_prices_is_current ON item_prices(is_current);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_updated_at BEFORE UPDATE ON shopping_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_prices_updated_at BEFORE UPDATE ON item_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically add items to shopping list when quantity is low
CREATE OR REPLACE FUNCTION check_low_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- If current quantity is below minimum quantity, add to shopping list
    IF NEW.current_quantity < NEW.minimum_quantity THEN
        INSERT INTO shopping_list (inventory_item_id, quantity_needed, priority)
        VALUES (NEW.id, NEW.minimum_quantity - NEW.current_quantity, 2)
        ON CONFLICT DO NOTHING; -- Prevent duplicates
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically add low inventory items to shopping list
CREATE TRIGGER check_low_inventory_trigger AFTER UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION check_low_inventory();

-- Create function to ensure only one current price per item per store
CREATE OR REPLACE FUNCTION ensure_single_current_price()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting is_current to true, set all other prices for this item at this store to false
    IF NEW.is_current = true THEN
        UPDATE item_prices 
        SET is_current = false 
        WHERE inventory_item_id = NEW.inventory_item_id 
        AND store_id = NEW.store_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to ensure single current price per item per store
CREATE TRIGGER ensure_single_current_price_trigger BEFORE INSERT OR UPDATE ON item_prices
    FOR EACH ROW EXECUTE FUNCTION ensure_single_current_price();
