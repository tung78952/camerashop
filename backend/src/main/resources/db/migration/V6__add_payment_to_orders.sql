-- Payment columns on orders (method, status, paid time, transaction number).

ALTER TABLE orders
    ADD COLUMN payment_method  VARCHAR(20) NOT NULL DEFAULT 'COD'
        CHECK (payment_method IN ('COD', 'VNPAY')),
    ADD COLUMN payment_status  VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
        CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED')),
    ADD COLUMN paid_at         TIMESTAMPTZ,
    ADD COLUMN payment_txn_no  VARCHAR(50);
