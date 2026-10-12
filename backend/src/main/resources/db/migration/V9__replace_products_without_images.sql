-- Replaces sample products that had no official images with similar current models.

UPDATE products SET name = 'Nikon Z5 II', image_url = '/products/nikon-z5-ii.jpg',
    description = 'Full-frame 24MP, bộ xử lý EXPEED 7, lấy nét nhận diện chủ thể, quay 4K 60p.'
    WHERE name = 'Nikon Z5';
UPDATE product_variants SET sku = 'NIKON-Z5II-BODY', price = 41990000 WHERE sku = 'NIKON-Z5-BODY';

UPDATE products SET name = 'Nikon Z50 II', image_url = '/products/nikon-z50-ii.jpg',
    description = 'APS-C 21MP nhỏ gọn, EXPEED 7, nút Picture Control riêng, hợp quay vlog.'
    WHERE name = 'Nikon Zfc';
UPDATE product_variants SET sku = 'NIKON-Z50II-BODY', price = 21990000 WHERE sku = 'NIKON-ZFC-BODY';

UPDATE products SET name = 'Sony FE 28-70mm F3.5-5.6 OSS II', image_url = '/products/sony-fe-28-70mm-f3-5-5-6-oss-ii.jpg',
    description = 'Ống kính kit thế hệ 2: nhẹ hơn, lấy nét nhanh và êm hơn, có chống rung.'
    WHERE name = 'Sony FE 28-70mm F3.5-5.6 OSS';
UPDATE product_variants SET sku = 'SONY-SEL2870II', price = 8990000 WHERE sku = 'SONY-SEL2870';

UPDATE products SET name = 'Nikon Z 24-105mm f/4-7.1', image_url = '/products/nikon-z-24-105mm-f-4-7-1.jpg',
    description = 'Ống kính zoom đa dụng nhỏ nhẹ cho máy Nikon Z full-frame.'
    WHERE name = 'Nikon Z 50mm f/1.8 S';
UPDATE product_variants SET sku = 'NIKON-Z24105', price = 11990000 WHERE sku = 'NIKON-Z50F18S';

UPDATE products SET name = 'Nikon Z 70-200mm f/2.8 VR S II', image_url = '/products/nikon-z-70-200mm-f-2-8-vr-s-ii.jpg',
    description = 'Ống kính tele chuyên nghiệp khẩu f/2.8, chống rung VR, nhẹ hơn thế hệ trước.'
    WHERE name = 'Nikon Z 24-70mm f/4 S';
UPDATE product_variants SET sku = 'NIKON-Z70200S2', price = 69990000 WHERE sku = 'NIKON-Z2470F4S';

UPDATE products SET name = 'Thẻ nhớ SanDisk Extreme PRO SDXC UHS-I', image_url = '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-i.jpg',
    description = 'Tốc độ đọc 200MB/s, chuẩn V30, phù hợp chụp liên tiếp và quay 4K.'
    WHERE name = 'Thẻ nhớ SanDisk Extreme SDXC UHS-I';
UPDATE product_variants SET sku = 'SANDISK-EXTPRO1-64' WHERE sku = 'SANDISK-EXT-64';
UPDATE product_variants SET sku = 'SANDISK-EXTPRO1-128' WHERE sku = 'SANDISK-EXT-128';

DELETE FROM cart_items WHERE product_variant_id IN (
    SELECT v.id FROM product_variants v JOIN products p ON p.id = v.product_id
    WHERE p.name IN ('Pin Nikon EN-EL15c', 'Pin Nikon EN-EL25'));

CREATE TEMPORARY TABLE removable_products ON COMMIT DROP AS
    SELECT p.id FROM products p
    WHERE p.name IN ('Pin Nikon EN-EL15c', 'Pin Nikon EN-EL25')
      AND NOT EXISTS (SELECT 1 FROM order_items oi JOIN product_variants v ON v.id = oi.product_variant_id
                      WHERE v.product_id = p.id);

DELETE FROM product_compatibility WHERE accessory_id IN (SELECT id FROM removable_products);
DELETE FROM product_variants WHERE product_id IN (SELECT id FROM removable_products);
DELETE FROM products WHERE id IN (SELECT id FROM removable_products);
