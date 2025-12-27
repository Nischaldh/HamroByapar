-- Buyers table
create table buyers(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name varchar(100),
	email varchar(100) unique,
	password text,
	role varchar(10) default 'buyer' check (role ='buyer'),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Sellers table
create table sellers(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name varchar(100),
	email varchar(100) unique,
	password text,
	role varchar(10) default 'seller' check (role ='seller'),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
	category TEXT,
    stock INT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Cart table
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
--cart constrain
ALTER TABLE cart ADD CONSTRAINT unique_cart_item UNIQUE (buyer_id, product_id);


--Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
);
ALTER TABLE orders
ADD COLUMN payment_method VARCHAR(50) NOT NULL;


--Orders Item
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

--Delivery Information 

CREATE TABLE delivery_info (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE, -- Link it to the orders table
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zipcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    method VARCHAR(50) NOT NULL, -- Payment method (e.g., Khalti, Esewa, COD)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seller Taxation Table
CREATE TABLE taxation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Auto-generate UUID for the id field
    seller_id UUID NOT NULL, -- Reference to the seller
    order_id UUID NOT NULL, -- Reference to the order
    tax_amount DECIMAL(10,2) NOT NULL, -- The calculated tax amount
    status VARCHAR(20) DEFAULT 'Pending', -- Tax status: 'Pending' or 'Paid'
    payment_date TIMESTAMP DEFAULT NULL, -- Timestamp when tax is paid
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for record creation
    -- Foreign key constraints for seller and order references
    CONSTRAINT fk_seller FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    -- Unique constraint for the combination of seller and order
    CONSTRAINT unique_seller_order UNIQUE (seller_id, order_id)
);


