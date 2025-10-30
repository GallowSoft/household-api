-- Create shopping_lists table (container for shopping lists)
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add shopping_list_id foreign key to shopping_list table (items)
ALTER TABLE shopping_list 
ADD COLUMN shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_shopping_lists_store_id ON shopping_lists(store_id);
CREATE INDEX idx_shopping_lists_created_by ON shopping_lists(created_by);
CREATE INDEX idx_shopping_lists_updated_by ON shopping_lists(updated_by);
CREATE INDEX idx_shopping_list_shopping_list_id ON shopping_list(shopping_list_id);

-- Add updated_at trigger for shopping_lists
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_and_user_column();


