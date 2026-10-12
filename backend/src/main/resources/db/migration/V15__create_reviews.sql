CREATE TABLE reviews (
    id          BIGSERIAL       PRIMARY KEY,
    product_id  BIGINT          NOT NULL REFERENCES products(id),
    user_id     BIGINT          NOT NULL REFERENCES users(id),
    rating      INTEGER         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     VARCHAR(1000),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product_created ON reviews (product_id, created_at DESC);
