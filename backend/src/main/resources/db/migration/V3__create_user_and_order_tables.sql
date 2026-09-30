CREATE TABLE users (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(60)     NOT NULL,
    role            VARCHAR(20)     NOT NULL CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TABLE carts (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE cart_items (
    id                  BIGSERIAL   PRIMARY KEY,
    quantity            INTEGER     NOT NULL CHECK (quantity > 0),
    cart_id             BIGINT      NOT NULL REFERENCES carts(id),
    product_variant_id  BIGINT      NOT NULL REFERENCES product_variants(id),
    UNIQUE (cart_id, product_variant_id)
);

CREATE TABLE orders (
    id              BIGSERIAL       PRIMARY KEY,
    total_amount    NUMERIC(20, 0)  NOT NULL CHECK (total_amount >= 0),
    receiver_name   VARCHAR(100)    NOT NULL,
    phone           VARCHAR(15)     NOT NULL,
    address         VARCHAR(255)    NOT NULL,
    status          VARCHAR(20)     NOT NULL CHECK (status IN ('PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    user_id         BIGINT          NOT NULL REFERENCES users(id)
);

CREATE TABLE order_items (
    id                  BIGSERIAL       PRIMARY KEY,
    quantity            INTEGER         NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(20, 0)  NOT NULL CHECK (unit_price >= 0),
    order_id            BIGINT          NOT NULL REFERENCES orders(id),
    product_variant_id  BIGINT          NOT NULL REFERENCES product_variants(id)
);
