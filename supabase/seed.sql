-- Seed data for household inventory system

-- Insert sample stores
INSERT INTO stores (name, address, phone, website) VALUES
('Walmart Supercenter', '123 Main St, Anytown, USA', '(555) 123-4567', 'https://walmart.com'),
('Target', '456 Oak Ave, Anytown, USA', '(555) 234-5678', 'https://target.com'),
('Kroger', '789 Pine St, Anytown, USA', '(555) 345-6789', 'https://kroger.com'),
('Costco', '321 Elm St, Anytown, USA', '(555) 456-7890', 'https://costco.com'),
('Whole Foods', '654 Maple Dr, Anytown, USA', '(555) 567-8901', 'https://wholefoodsmarket.com');

-- Insert sample inventory items
INSERT INTO inventory_items (name, description, category, brand, unit_of_measure, current_quantity, minimum_quantity, maximum_quantity, storage_location) VALUES
('Milk', 'Whole milk, 1 gallon', 'Dairy', 'Generic', 'gallon', 0.5, 1, 3, 'refrigerator'),
('Bread', 'Whole wheat bread', 'Bakery', 'Wonder', 'loaf', 0, 1, 2, 'pantry'),
('Eggs', 'Large eggs, dozen', 'Dairy', 'Generic', 'dozen', 1, 1, 2, 'refrigerator'),
('Bananas', 'Fresh bananas', 'Produce', 'Generic', 'lb', 2, 3, 5, 'counter'),
('Chicken Breast', 'Boneless, skinless chicken breast', 'Meat', 'Generic', 'lb', 0, 2, 5, 'freezer'),
('Rice', 'Long grain white rice', 'Grains', 'Uncle Bens', 'lb', 5, 2, 10, 'pantry'),
('Apples', 'Red delicious apples', 'Produce', 'Generic', 'lb', 1, 2, 4, 'refrigerator'),
('Pasta', 'Spaghetti pasta', 'Grains', 'Barilla', 'box', 2, 3, 6, 'pantry'),
('Cheese', 'Cheddar cheese, shredded', 'Dairy', 'Kraft', 'bag', 0, 1, 3, 'refrigerator'),
('Tomatoes', 'Roma tomatoes', 'Produce', 'Generic', 'lb', 0, 2, 4, 'counter');

-- Insert sample item prices
INSERT INTO item_prices (inventory_item_id, store_id, price, is_current) VALUES
-- Milk prices
((SELECT id FROM inventory_items WHERE name = 'Milk'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 3.47, true),
((SELECT id FROM inventory_items WHERE name = 'Milk'), (SELECT id FROM stores WHERE name = 'Target'), 3.29, true),
((SELECT id FROM inventory_items WHERE name = 'Milk'), (SELECT id FROM stores WHERE name = 'Kroger'), 3.19, true),
((SELECT id FROM inventory_items WHERE name = 'Milk'), (SELECT id FROM stores WHERE name = 'Costco'), 2.99, true),

-- Bread prices
((SELECT id FROM inventory_items WHERE name = 'Bread'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 1.98, true),
((SELECT id FROM inventory_items WHERE name = 'Bread'), (SELECT id FROM stores WHERE name = 'Target'), 2.19, true),
((SELECT id FROM inventory_items WHERE name = 'Bread'), (SELECT id FROM stores WHERE name = 'Kroger'), 1.89, true),

-- Eggs prices
((SELECT id FROM inventory_items WHERE name = 'Eggs'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 2.47, true),
((SELECT id FROM inventory_items WHERE name = 'Eggs'), (SELECT id FROM stores WHERE name = 'Target'), 2.29, true),
((SELECT id FROM inventory_items WHERE name = 'Eggs'), (SELECT id FROM stores WHERE name = 'Kroger'), 2.19, true),
((SELECT id FROM inventory_items WHERE name = 'Eggs'), (SELECT id FROM stores WHERE name = 'Costco'), 1.99, true),

-- Bananas prices
((SELECT id FROM inventory_items WHERE name = 'Bananas'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 0.58, true),
((SELECT id FROM inventory_items WHERE name = 'Bananas'), (SELECT id FROM stores WHERE name = 'Target'), 0.59, true),
((SELECT id FROM inventory_items WHERE name = 'Bananas'), (SELECT id FROM stores WHERE name = 'Kroger'), 0.57, true),

-- Chicken Breast prices
((SELECT id FROM inventory_items WHERE name = 'Chicken Breast'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 3.97, true),
((SELECT id FROM inventory_items WHERE name = 'Chicken Breast'), (SELECT id FROM stores WHERE name = 'Target'), 4.19, true),
((SELECT id FROM inventory_items WHERE name = 'Chicken Breast'), (SELECT id FROM stores WHERE name = 'Kroger'), 3.89, true),
((SELECT id FROM inventory_items WHERE name = 'Chicken Breast'), (SELECT id FROM stores WHERE name = 'Costco'), 2.99, true),

-- Rice prices
((SELECT id FROM inventory_items WHERE name = 'Rice'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 1.98, true),
((SELECT id FROM inventory_items WHERE name = 'Rice'), (SELECT id FROM stores WHERE name = 'Target'), 2.19, true),
((SELECT id FROM inventory_items WHERE name = 'Rice'), (SELECT id FROM stores WHERE name = 'Kroger'), 1.89, true),

-- Apples prices
((SELECT id FROM inventory_items WHERE name = 'Apples'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 1.47, true),
((SELECT id FROM inventory_items WHERE name = 'Apples'), (SELECT id FROM stores WHERE name = 'Target'), 1.59, true),
((SELECT id FROM inventory_items WHERE name = 'Apples'), (SELECT id FROM stores WHERE name = 'Kroger'), 1.39, true),

-- Pasta prices
((SELECT id FROM inventory_items WHERE name = 'Pasta'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 1.48, true),
((SELECT id FROM inventory_items WHERE name = 'Pasta'), (SELECT id FROM stores WHERE name = 'Target'), 1.69, true),
((SELECT id FROM inventory_items WHERE name = 'Pasta'), (SELECT id FROM stores WHERE name = 'Kroger'), 1.39, true),

-- Cheese prices
((SELECT id FROM inventory_items WHERE name = 'Cheese'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 2.98, true),
((SELECT id FROM inventory_items WHERE name = 'Cheese'), (SELECT id FROM stores WHERE name = 'Target'), 3.19, true),
((SELECT id FROM inventory_items WHERE name = 'Cheese'), (SELECT id FROM stores WHERE name = 'Kroger'), 2.89, true),

-- Tomatoes prices
((SELECT id FROM inventory_items WHERE name = 'Tomatoes'), (SELECT id FROM stores WHERE name = 'Walmart Supercenter'), 1.98, true),
((SELECT id FROM inventory_items WHERE name = 'Tomatoes'), (SELECT id FROM stores WHERE name = 'Target'), 2.19, true),
((SELECT id FROM inventory_items WHERE name = 'Tomatoes'), (SELECT id FROM stores WHERE name = 'Kroger'), 1.89, true);

-- Insert some items into shopping list (items with low inventory)
INSERT INTO shopping_list (inventory_item_id, quantity_needed, priority, notes) VALUES
((SELECT id FROM inventory_items WHERE name = 'Bread'), 1, 2, 'Need for breakfast'),
((SELECT id FROM inventory_items WHERE name = 'Cheese'), 1, 1, 'For cooking'),
((SELECT id FROM inventory_items WHERE name = 'Tomatoes'), 2, 2, 'For salads and cooking');
