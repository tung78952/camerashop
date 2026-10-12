-- Seed data: sample brands, categories, mounts, products, variants and compatibility.

INSERT INTO brands (name) VALUES
    ('Sony'), ('Canon'), ('Nikon'), ('Fujifilm'), ('SanDisk');

INSERT INTO categories (name) VALUES
    ('Máy ảnh'), ('Ống kính'), ('Pin & sạc'), ('Thẻ nhớ');

INSERT INTO mounts (name) VALUES
    ('Sony E'), ('Canon RF'), ('Nikon Z'), ('Fujifilm X');

INSERT INTO products (name, description, brand_id, category_id, mount_id)
SELECT v.name, v.description, b.id, c.id, m.id
FROM (VALUES
    ('Sony Alpha 7 IV',        'Full-frame 33MP, quay 4K 60p, lấy nét mắt theo thời gian thực.',            'Sony',     'Máy ảnh',   'Sony E'),
    ('Sony Alpha 7 III',       'Full-frame 24MP, pin bền, lựa chọn phổ biến cho người mới lên full-frame.', 'Sony',     'Máy ảnh',   'Sony E'),
    ('Sony Alpha 6400',        'APS-C 24MP nhỏ gọn, lấy nét nhanh, màn hình lật selfie.',                   'Sony',     'Máy ảnh',   'Sony E'),
    ('Sony ZV-E10',            'APS-C cho vlog, micro định hướng, chế độ quay sản phẩm.',                   'Sony',     'Máy ảnh',   'Sony E'),
    ('Canon EOS R6 Mark II',   'Full-frame 24MP, chụp liên tiếp 40 fps, chống rung trong thân máy.',        'Canon',    'Máy ảnh',   'Canon RF'),
    ('Canon EOS R8',           'Full-frame 24MP gọn nhẹ nhất dòng R, hợp chụp du lịch.',                    'Canon',    'Máy ảnh',   'Canon RF'),
    ('Canon EOS R50',          'APS-C 24MP cho người mới, giao diện hướng dẫn dễ dùng.',                    'Canon',    'Máy ảnh',   'Canon RF'),
    ('Nikon Z6 II',            'Full-frame 24MP, hai khe thẻ, quay 4K 60p.',                                'Nikon',    'Máy ảnh',   'Nikon Z'),
    ('Nikon Z5',               'Full-frame 24MP giá dễ tiếp cận, chống rung 5 trục.',                       'Nikon',    'Máy ảnh',   'Nikon Z'),
    ('Nikon Zfc',              'APS-C 21MP thiết kế cổ điển với các vòng xoay cơ.',                         'Nikon',    'Máy ảnh',   'Nikon Z'),
    ('Fujifilm X-T5',          'APS-C 40MP, giả lập màu phim, thân máy vòng xoay truyền thống.',            'Fujifilm', 'Máy ảnh',   'Fujifilm X'),
    ('Fujifilm X-S20',         'APS-C 26MP, pin lớn, báng cầm sâu, mạnh về quay video.',                    'Fujifilm', 'Máy ảnh',   'Fujifilm X'),
    ('Fujifilm X100VI',        'Máy ảnh ống kính liền 23mm f/2, cảm biến 40MP, chống rung.',                'Fujifilm', 'Máy ảnh',   NULL),
    ('Sony FE 50mm F1.8',                 'Ống kính fix chân dung giá rẻ cho ngàm Sony E.',          'Sony',     'Ống kính', 'Sony E'),
    ('Sony FE 85mm F1.8',                 'Ống kính chân dung xóa phông đẹp, lấy nét nhanh.',        'Sony',     'Ống kính', 'Sony E'),
    ('Sony FE 28-70mm F3.5-5.6 OSS',      'Ống kính kit đa dụng, có chống rung.',                    'Sony',     'Ống kính', 'Sony E'),
    ('Sony E 18-135mm F3.5-5.6 OSS',      'Ống kính du lịch dải tiêu cự rộng cho máy APS-C.',        'Sony',     'Ống kính', 'Sony E'),
    ('Canon RF 50mm F1.8 STM',            'Ống kính fix nhỏ gọn, lấy nét êm cho quay phim.',         'Canon',    'Ống kính', 'Canon RF'),
    ('Canon RF 24-105mm F4-7.1 IS STM',   'Ống kính zoom đa dụng, nhẹ, có chống rung.',              'Canon',    'Ống kính', 'Canon RF'),
    ('Nikon Z 50mm f/1.8 S',              'Ống kính fix độ nét cao dòng S.',                         'Nikon',    'Ống kính', 'Nikon Z'),
    ('Nikon Z 24-70mm f/4 S',             'Ống kính zoom tiêu chuẩn, chống bụi ẩm.',                 'Nikon',    'Ống kính', 'Nikon Z'),
    ('Fujifilm XF 35mm F1.4 R',           'Ống kính fix huyền thoại, màu và bokeh đặc trưng.',       'Fujifilm', 'Ống kính', 'Fujifilm X'),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 'Ống kính kit khẩu lớn hơn kit thông thường.',          'Fujifilm', 'Ống kính', 'Fujifilm X'),
    ('Pin Sony NP-FZ100',       'Pin chính hãng dung lượng cao cho dòng Alpha full-frame.', 'Sony',     'Pin & sạc', NULL),
    ('Sạc Sony BC-QZ1',         'Sạc rời cho pin NP-FZ100.',                                 'Sony',     'Pin & sạc', NULL),
    ('Pin Sony NP-FW50',        'Pin chính hãng cho dòng APS-C.',                            'Sony',     'Pin & sạc', NULL),
    ('Pin Canon LP-E6NH',       'Pin chính hãng dung lượng cao.',                            'Canon',    'Pin & sạc', NULL),
    ('Pin Canon LP-E17',        'Pin chính hãng nhỏ gọn.',                                   'Canon',    'Pin & sạc', NULL),
    ('Pin Nikon EN-EL15c',      'Pin chính hãng, hỗ trợ sạc qua USB-C trong máy.',           'Nikon',    'Pin & sạc', NULL),
    ('Pin Nikon EN-EL25',       'Pin chính hãng cho dòng Z APS-C.',                          'Nikon',    'Pin & sạc', NULL),
    ('Pin Fujifilm NP-W235',    'Pin chính hãng dung lượng lớn.',                            'Fujifilm', 'Pin & sạc', NULL),
    ('Pin Fujifilm NP-W126S',   'Pin chính hãng nhỏ gọn.',                                   'Fujifilm', 'Pin & sạc', NULL),
    ('Thẻ nhớ SanDisk Extreme SDXC UHS-I',      'Tốc độ đọc 180MB/s, phù hợp chụp ảnh và quay 4K.',         'SanDisk', 'Thẻ nhớ', NULL),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-II', 'Tốc độ đọc 300MB/s cho chụp liên tiếp và quay bitrate cao.', 'SanDisk', 'Thẻ nhớ', NULL)
) AS v(name, description, brand, category, mount)
JOIN brands b     ON b.name = v.brand
JOIN categories c ON c.name = v.category
LEFT JOIN mounts m ON m.name = v.mount;

INSERT INTO product_variants (name, sku, price, stock, product_id)
SELECT v.name, v.sku, v.price, v.stock, p.id
FROM (VALUES
    ('Sony Alpha 7 IV',  'Body only',            'SONY-A7IV-BODY',     52990000, 8),
    ('Sony Alpha 7 IV',  'Kit 28-70mm',          'SONY-A7IV-KIT2870',  57990000, 5),
    ('Sony Alpha 7 III', 'Body only',            'SONY-A7III-BODY',    36990000, 6),
    ('Sony Alpha 6400',  'Body only',            'SONY-A6400-BODY',    20990000, 10),
    ('Sony Alpha 6400',  'Kit 18-135mm',         'SONY-A6400-KIT18135', 29990000, 4),
    ('Sony ZV-E10',      'Body only - Đen',      'SONY-ZVE10-BODY-BLK', 14990000, 12),
    ('Sony ZV-E10',      'Body only - Trắng',    'SONY-ZVE10-BODY-WHT', 14990000, 3),
    ('Canon EOS R6 Mark II', 'Body only',        'CANON-R6II-BODY',    55990000, 4),
    ('Canon EOS R6 Mark II', 'Kit 24-105mm F4-7.1', 'CANON-R6II-KIT24105', 63990000, 2),
    ('Canon EOS R8',     'Body only',            'CANON-R8-BODY',      33990000, 7),
    ('Canon EOS R50',    'Body only - Đen',      'CANON-R50-BODY-BLK', 16990000, 9),
    ('Canon EOS R50',    'Body only - Trắng',    'CANON-R50-BODY-WHT', 16990000, 5),
    ('Nikon Z6 II',      'Body only',            'NIKON-Z6II-BODY',    39990000, 5),
    ('Nikon Z6 II',      'Kit 24-70mm f/4',      'NIKON-Z6II-KIT2470', 52990000, 2),
    ('Nikon Z5',         'Body only',            'NIKON-Z5-BODY',      27990000, 6),
    ('Nikon Zfc',        'Body only',            'NIKON-ZFC-BODY',     21990000, 5),
    ('Fujifilm X-T5',    'Body only - Đen',      'FUJI-XT5-BODY-BLK',  41990000, 4),
    ('Fujifilm X-T5',    'Body only - Bạc',      'FUJI-XT5-BODY-SLV',  41990000, 3),
    ('Fujifilm X-T5',    'Kit 18-55mm - Đen',    'FUJI-XT5-KIT1855-BLK', 50990000, 2),
    ('Fujifilm X-S20',   'Body only',            'FUJI-XS20-BODY',     30990000, 6),
    ('Fujifilm X100VI',  'Đen',                  'FUJI-X100VI-BLK',    43990000, 1),
    ('Fujifilm X100VI',  'Bạc',                  'FUJI-X100VI-SLV',    43990000, 1),

    ('Sony FE 50mm F1.8',                 'Tiêu chuẩn', 'SONY-SEL50F18F',   5490000, 15),
    ('Sony FE 85mm F1.8',                 'Tiêu chuẩn', 'SONY-SEL85F18',   13990000, 6),
    ('Sony FE 28-70mm F3.5-5.6 OSS',      'Tiêu chuẩn', 'SONY-SEL2870',     6990000, 8),
    ('Sony E 18-135mm F3.5-5.6 OSS',      'Tiêu chuẩn', 'SONY-SEL18135',   11990000, 5),
    ('Canon RF 50mm F1.8 STM',            'Tiêu chuẩn', 'CANON-RF50F18',    4990000, 14),
    ('Canon RF 24-105mm F4-7.1 IS STM',   'Tiêu chuẩn', 'CANON-RF24105STM', 9490000, 6),
    ('Nikon Z 50mm f/1.8 S',              'Tiêu chuẩn', 'NIKON-Z50F18S',   13490000, 5),
    ('Nikon Z 24-70mm f/4 S',             'Tiêu chuẩn', 'NIKON-Z2470F4S',  21990000, 3),
    ('Fujifilm XF 35mm F1.4 R',           'Tiêu chuẩn', 'FUJI-XF35F14',    13990000, 4),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 'Tiêu chuẩn', 'FUJI-XF1855',   14990000, 5),

    ('Pin Sony NP-FZ100',     'Tiêu chuẩn', 'SONY-NPFZ100',   1990000, 20),
    ('Sạc Sony BC-QZ1',       'Tiêu chuẩn', 'SONY-BCQZ1',     1690000, 8),
    ('Pin Sony NP-FW50',      'Tiêu chuẩn', 'SONY-NPFW50',     990000, 25),
    ('Pin Canon LP-E6NH',     'Tiêu chuẩn', 'CANON-LPE6NH',   1890000, 15),
    ('Pin Canon LP-E17',      'Tiêu chuẩn', 'CANON-LPE17',    1190000, 18),
    ('Pin Nikon EN-EL15c',    'Tiêu chuẩn', 'NIKON-ENEL15C',  1790000, 12),
    ('Pin Nikon EN-EL25',     'Tiêu chuẩn', 'NIKON-ENEL25',   1290000, 10),
    ('Pin Fujifilm NP-W235',  'Tiêu chuẩn', 'FUJI-NPW235',    1890000, 12),
    ('Pin Fujifilm NP-W126S', 'Tiêu chuẩn', 'FUJI-NPW126S',   1190000, 14),

    ('Thẻ nhớ SanDisk Extreme SDXC UHS-I',      '64GB',  'SANDISK-EXT-64',     490000, 40),
    ('Thẻ nhớ SanDisk Extreme SDXC UHS-I',      '128GB', 'SANDISK-EXT-128',    790000, 35),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-II', '128GB', 'SANDISK-EXTPRO-128', 2490000, 10),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-II', '256GB', 'SANDISK-EXTPRO-256', 4290000, 6)
) AS v(product, name, sku, price, stock)
JOIN products p ON p.name = v.product;

INSERT INTO product_compatibility (accessory_id, camera_id)
SELECT a.id, c.id
FROM (VALUES
    ('Pin Sony NP-FZ100',     'Sony Alpha 7 IV'),
    ('Pin Sony NP-FZ100',     'Sony Alpha 7 III'),
    ('Sạc Sony BC-QZ1',       'Sony Alpha 7 IV'),
    ('Sạc Sony BC-QZ1',       'Sony Alpha 7 III'),
    ('Pin Sony NP-FW50',      'Sony Alpha 6400'),
    ('Pin Sony NP-FW50',      'Sony ZV-E10'),
    ('Pin Canon LP-E6NH',     'Canon EOS R6 Mark II'),
    ('Pin Canon LP-E17',      'Canon EOS R8'),
    ('Pin Canon LP-E17',      'Canon EOS R50'),
    ('Pin Nikon EN-EL15c',    'Nikon Z6 II'),
    ('Pin Nikon EN-EL15c',    'Nikon Z5'),
    ('Pin Nikon EN-EL25',     'Nikon Zfc'),
    ('Pin Fujifilm NP-W235',  'Fujifilm X-T5'),
    ('Pin Fujifilm NP-W235',  'Fujifilm X-S20'),
    ('Pin Fujifilm NP-W126S', 'Fujifilm X100VI')
) AS v(accessory, camera)
JOIN products a ON a.name = v.accessory
JOIN products c ON c.name = v.camera;
