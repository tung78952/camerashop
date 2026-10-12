-- Catalog schema: brands, categories, mounts, products, variants and the battery-camera compatibility table.

CREATE TABLE brands (
    id   BIGSERIAL       PRIMARY KEY,
    name VARCHAR(100)    NOT NULL UNIQUE 
);

CREATE TABLE categories (
    id   BIGSERIAL       PRIMARY KEY,
    name VARCHAR(100)    NOT NULL UNIQUE
);

CREATE TABLE mounts (
    id   BIGSERIAL       PRIMARY KEY,
    name VARCHAR(100)    NOT NULL UNIQUE
);

CREATE TABLE products (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    brand_id        BIGINT          NOT NULL    REFERENCES brands(id),
    category_id     BIGINT          NOT NULL    REFERENCES categories(id),
    mount_id        BIGINT                      REFERENCES mounts(id)
);

CREATE TABLE product_variants (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    sku             VARCHAR(50)     NOT NULL UNIQUE,
    price           NUMERIC(20, 0)  NOT NULL CHECK (price >= 0),
    stock           INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    product_id      BIGINT          NOT NULL    REFERENCES products(id)
);

CREATE TABLE product_compatibility (
    accessory_id    BIGINT                      REFERENCES products(id),
    camera_id       BIGINT                      REFERENCES products(id),
    PRIMARY KEY (accessory_id, camera_id)
);


