-- Refreshes sample models and their image galleries; main image = first gallery image.

UPDATE products SET name = 'Sony Alpha 7C II',
    description = 'Full-frame 33MP nhỏ gọn, lấy nét AI nhận diện chủ thể, chống rung 7 stop, quay 4K 60p.'
    WHERE name = 'Sony Alpha 7 III';
UPDATE product_variants SET sku = 'SONY-A7CII-BODY', price = 47990000 WHERE sku = 'SONY-A7III-BODY';

UPDATE products SET name = 'Sony ZV-E10 II',
    description = 'APS-C 26MP cho vlog, quay 4K 60p 10-bit, pin NP-FZ100 dung lượng lớn.'
    WHERE name = 'Sony ZV-E10';
UPDATE product_variants SET sku = 'SONY-ZVE10II-BODY-BLK', price = 23990000 WHERE sku = 'SONY-ZVE10-BODY-BLK';
UPDATE product_variants SET sku = 'SONY-ZVE10II-BODY-WHT', price = 23990000 WHERE sku = 'SONY-ZVE10-BODY-WHT';

DELETE FROM product_compatibility
WHERE accessory_id = (SELECT id FROM products WHERE name = 'Pin Sony NP-FW50')
  AND camera_id    = (SELECT id FROM products WHERE name = 'Sony ZV-E10 II');
INSERT INTO product_compatibility (accessory_id, camera_id)
SELECT a.id, c.id FROM products a, products c
WHERE a.name IN ('Pin Sony NP-FZ100', 'Sạc Sony BC-QZ1') AND c.name = 'Sony ZV-E10 II'
ON CONFLICT DO NOTHING;

UPDATE products SET image_url = '/products/sony-alpha-7-iv/0-1651c0b9.jpg' WHERE name = 'Sony Alpha 7 IV';
UPDATE products SET image_url = '/products/sony-alpha-7c-ii/0-37b4e4db.jpg' WHERE name = 'Sony Alpha 7C II';
UPDATE products SET image_url = '/products/sony-alpha-6400/0-b0067655.jpg' WHERE name = 'Sony Alpha 6400';
UPDATE products SET image_url = '/products/sony-zv-e10-ii/0-a8e977e2.jpg' WHERE name = 'Sony ZV-E10 II';
UPDATE products SET image_url = '/products/sony-fe-50mm-f1-8/0-6356866e.jpg' WHERE name = 'Sony FE 50mm F1.8';
UPDATE products SET image_url = '/products/sony-fe-85mm-f1-8/0-f441f08a.jpg' WHERE name = 'Sony FE 85mm F1.8';
UPDATE products SET image_url = '/products/sony-fe-28-70mm-f3-5-5-6-oss-ii/0-c7ff7b60.jpg' WHERE name = 'Sony FE 28-70mm F3.5-5.6 OSS II';
UPDATE products SET image_url = '/products/sony-e-18-135mm-f3-5-5-6-oss/0-597cfa01.jpg' WHERE name = 'Sony E 18-135mm F3.5-5.6 OSS';
UPDATE products SET image_url = '/products/pin-sony-np-fz100/0-7601a3a2.jpg' WHERE name = 'Pin Sony NP-FZ100';
UPDATE products SET image_url = '/products/sac-sony-bc-qz1/0-d07a4784.jpg' WHERE name = 'Sạc Sony BC-QZ1';
UPDATE products SET image_url = '/products/pin-sony-np-fw50/0-65eddd3d.jpg' WHERE name = 'Pin Sony NP-FW50';
UPDATE products SET image_url = '/products/canon-eos-r6-mark-ii/0-588a0d9b.jpg' WHERE name = 'Canon EOS R6 Mark II';
UPDATE products SET image_url = '/products/canon-eos-r8/0-c58e5e10.jpg' WHERE name = 'Canon EOS R8';
UPDATE products SET image_url = '/products/canon-eos-r50/0-93babe5c.jpg' WHERE name = 'Canon EOS R50';
UPDATE products SET image_url = '/products/canon-rf-50mm-f1-8-stm/0-fdf4caf9.jpg' WHERE name = 'Canon RF 50mm F1.8 STM';
UPDATE products SET image_url = '/products/canon-rf-24-105mm-f4-7-1-is-stm/0-576cee24.jpg' WHERE name = 'Canon RF 24-105mm F4-7.1 IS STM';
UPDATE products SET image_url = '/products/pin-canon-lp-e6nh/0-b5a55272.jpg' WHERE name = 'Pin Canon LP-E6NH';
UPDATE products SET image_url = '/products/pin-canon-lp-e17/0-7e7fe1ba.jpg' WHERE name = 'Pin Canon LP-E17';
UPDATE products SET image_url = '/products/nikon-z6-ii/0-01a19ea8.jpg' WHERE name = 'Nikon Z6 II';
UPDATE products SET image_url = '/products/nikon-z5-ii/0-ef8320ea.jpg' WHERE name = 'Nikon Z5 II';
UPDATE products SET image_url = '/products/nikon-z50-ii/0-0eec01ab.jpg' WHERE name = 'Nikon Z50 II';
UPDATE products SET image_url = '/products/nikon-z-24-105mm-f-4-7-1/0-16963f56.jpg' WHERE name = 'Nikon Z 24-105mm f/4-7.1';
UPDATE products SET image_url = '/products/nikon-z-70-200mm-f-2-8-vr-s-ii/0-ddee77ee.jpg' WHERE name = 'Nikon Z 70-200mm f/2.8 VR S II';
UPDATE products SET image_url = '/products/fujifilm-x-t5/0-deb0994b.jpg' WHERE name = 'Fujifilm X-T5';
UPDATE products SET image_url = '/products/fujifilm-x-s20/0-2db7d3d5.jpg' WHERE name = 'Fujifilm X-S20';
UPDATE products SET image_url = '/products/fujifilm-x100vi/0-2329cb46.jpg' WHERE name = 'Fujifilm X100VI';
UPDATE products SET image_url = '/products/fujifilm-xf-35mm-f1-4-r/0-0023db0f.jpg' WHERE name = 'Fujifilm XF 35mm F1.4 R';
UPDATE products SET image_url = '/products/fujifilm-xf-18-55mm-f2-8-4-r-lm-ois/0-735c2266.jpg' WHERE name = 'Fujifilm XF 18-55mm F2.8-4 R LM OIS';
UPDATE products SET image_url = '/products/pin-fujifilm-np-w235/0-6996fdf7.jpg' WHERE name = 'Pin Fujifilm NP-W235';
UPDATE products SET image_url = '/products/pin-fujifilm-np-w126s/0-440e69ac.jpg' WHERE name = 'Pin Fujifilm NP-W126S';
UPDATE products SET image_url = '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-ii/0-b3f91a6d.jpg' WHERE name = 'Thẻ nhớ SanDisk Extreme PRO SDXC UHS-II';
UPDATE products SET image_url = '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-i/0-42bbce96.jpg' WHERE name = 'Thẻ nhớ SanDisk Extreme PRO SDXC UHS-I';

DELETE FROM product_images;

INSERT INTO product_images (product_id, sort_order, url)
SELECT p.id, v.sort_order, v.url
FROM (VALUES
    ('Sony Alpha 7 IV', 0, '/products/sony-alpha-7-iv/0-1651c0b9.jpg'),
    ('Sony Alpha 7 IV', 1, '/products/sony-alpha-7-iv/1-9c0090d9.jpg'),
    ('Sony Alpha 7 IV', 2, '/products/sony-alpha-7-iv/2-7bac0b64.jpg'),
    ('Sony Alpha 7 IV', 3, '/products/sony-alpha-7-iv/3-4aaf64be.jpg'),
    ('Sony Alpha 7 IV', 4, '/products/sony-alpha-7-iv/4-ff34d4e8.jpg'),
    ('Sony Alpha 7 IV', 5, '/products/sony-alpha-7-iv/5-0215b6e5.jpg'),
    ('Sony Alpha 7 IV', 6, '/products/sony-alpha-7-iv/6-4bd3aff5.jpg'),
    ('Sony Alpha 7 IV', 7, '/products/sony-alpha-7-iv/7-adda81b0.jpg'),
    ('Sony Alpha 7C II', 0, '/products/sony-alpha-7c-ii/0-37b4e4db.jpg'),
    ('Sony Alpha 7C II', 1, '/products/sony-alpha-7c-ii/1-90ae8f48.jpg'),
    ('Sony Alpha 7C II', 2, '/products/sony-alpha-7c-ii/2-9e3c29df.jpg'),
    ('Sony Alpha 7C II', 3, '/products/sony-alpha-7c-ii/3-e8323239.jpg'),
    ('Sony Alpha 7C II', 4, '/products/sony-alpha-7c-ii/4-5d89c5a7.jpg'),
    ('Sony Alpha 7C II', 5, '/products/sony-alpha-7c-ii/5-ac2aecec.jpg'),
    ('Sony Alpha 6400', 0, '/products/sony-alpha-6400/0-b0067655.jpg'),
    ('Sony Alpha 6400', 1, '/products/sony-alpha-6400/1-a6be01e7.jpg'),
    ('Sony Alpha 6400', 2, '/products/sony-alpha-6400/2-7e66c222.jpg'),
    ('Sony Alpha 6400', 3, '/products/sony-alpha-6400/3-8c8a0444.jpg'),
    ('Sony Alpha 6400', 4, '/products/sony-alpha-6400/4-0e1e174a.jpg'),
    ('Sony Alpha 6400', 5, '/products/sony-alpha-6400/5-11e267de.jpg'),
    ('Sony ZV-E10 II', 0, '/products/sony-zv-e10-ii/0-a8e977e2.jpg'),
    ('Sony ZV-E10 II', 1, '/products/sony-zv-e10-ii/1-ec547588.jpg'),
    ('Sony ZV-E10 II', 2, '/products/sony-zv-e10-ii/2-05b66d8b.jpg'),
    ('Sony ZV-E10 II', 3, '/products/sony-zv-e10-ii/3-360146b8.jpg'),
    ('Sony ZV-E10 II', 4, '/products/sony-zv-e10-ii/4-93fa4d77.jpg'),
    ('Sony ZV-E10 II', 5, '/products/sony-zv-e10-ii/5-a26a1713.jpg'),
    ('Sony FE 50mm F1.8', 0, '/products/sony-fe-50mm-f1-8/0-6356866e.jpg'),
    ('Sony FE 50mm F1.8', 1, '/products/sony-fe-50mm-f1-8/1-17f7d7a5.jpg'),
    ('Sony FE 50mm F1.8', 2, '/products/sony-fe-50mm-f1-8/2-c3d9d2f9.jpg'),
    ('Sony FE 50mm F1.8', 3, '/products/sony-fe-50mm-f1-8/3-0e2f4a58.jpg'),
    ('Sony FE 50mm F1.8', 4, '/products/sony-fe-50mm-f1-8/4-a497aadb.jpg'),
    ('Sony FE 50mm F1.8', 5, '/products/sony-fe-50mm-f1-8/5-4540fcca.jpg'),
    ('Sony FE 85mm F1.8', 0, '/products/sony-fe-85mm-f1-8/0-f441f08a.jpg'),
    ('Sony FE 85mm F1.8', 1, '/products/sony-fe-85mm-f1-8/1-f96a9ec4.jpg'),
    ('Sony FE 85mm F1.8', 2, '/products/sony-fe-85mm-f1-8/2-d929f138.jpg'),
    ('Sony FE 85mm F1.8', 3, '/products/sony-fe-85mm-f1-8/3-1e1fd7b3.jpg'),
    ('Sony FE 85mm F1.8', 4, '/products/sony-fe-85mm-f1-8/4-54b19ba3.jpg'),
    ('Sony FE 28-70mm F3.5-5.6 OSS II', 0, '/products/sony-fe-28-70mm-f3-5-5-6-oss-ii/0-c7ff7b60.jpg'),
    ('Sony FE 28-70mm F3.5-5.6 OSS II', 1, '/products/sony-fe-28-70mm-f3-5-5-6-oss-ii/1-e8bb6e5a.jpg'),
    ('Sony FE 28-70mm F3.5-5.6 OSS II', 2, '/products/sony-fe-28-70mm-f3-5-5-6-oss-ii/2-9ae674ee.jpg'),
    ('Sony FE 28-70mm F3.5-5.6 OSS II', 3, '/products/sony-fe-28-70mm-f3-5-5-6-oss-ii/3-ebdd56ee.jpg'),
    ('Sony E 18-135mm F3.5-5.6 OSS', 0, '/products/sony-e-18-135mm-f3-5-5-6-oss/0-597cfa01.jpg'),
    ('Sony E 18-135mm F3.5-5.6 OSS', 1, '/products/sony-e-18-135mm-f3-5-5-6-oss/1-831391d0.jpg'),
    ('Sony E 18-135mm F3.5-5.6 OSS', 2, '/products/sony-e-18-135mm-f3-5-5-6-oss/2-32530389.jpg'),
    ('Sony E 18-135mm F3.5-5.6 OSS', 3, '/products/sony-e-18-135mm-f3-5-5-6-oss/3-aeadd2eb.jpg'),
    ('Sony E 18-135mm F3.5-5.6 OSS', 4, '/products/sony-e-18-135mm-f3-5-5-6-oss/4-b54ef918.jpg'),
    ('Sony E 18-135mm F3.5-5.6 OSS', 5, '/products/sony-e-18-135mm-f3-5-5-6-oss/5-df63e3ac.jpg'),
    ('Pin Sony NP-FZ100', 0, '/products/pin-sony-np-fz100/0-7601a3a2.jpg'),
    ('Pin Sony NP-FZ100', 1, '/products/pin-sony-np-fz100/1-2f0bee79.jpg'),
    ('Sạc Sony BC-QZ1', 0, '/products/sac-sony-bc-qz1/0-d07a4784.jpg'),
    ('Sạc Sony BC-QZ1', 1, '/products/sac-sony-bc-qz1/1-194160be.jpg'),
    ('Pin Sony NP-FW50', 0, '/products/pin-sony-np-fw50/0-65eddd3d.jpg'),
    ('Canon EOS R6 Mark II', 0, '/products/canon-eos-r6-mark-ii/0-588a0d9b.jpg'),
    ('Canon EOS R6 Mark II', 1, '/products/canon-eos-r6-mark-ii/1-6ed5c985.jpg'),
    ('Canon EOS R6 Mark II', 2, '/products/canon-eos-r6-mark-ii/2-2b56e1a7.jpg'),
    ('Canon EOS R6 Mark II', 3, '/products/canon-eos-r6-mark-ii/3-efa4f44b.jpg'),
    ('Canon EOS R6 Mark II', 4, '/products/canon-eos-r6-mark-ii/4-ed357548.jpg'),
    ('Canon EOS R6 Mark II', 5, '/products/canon-eos-r6-mark-ii/5-c27a66a3.jpg'),
    ('Canon EOS R8', 0, '/products/canon-eos-r8/0-c58e5e10.jpg'),
    ('Canon EOS R8', 1, '/products/canon-eos-r8/1-8baed402.jpg'),
    ('Canon EOS R8', 2, '/products/canon-eos-r8/2-6b39b29f.jpg'),
    ('Canon EOS R8', 3, '/products/canon-eos-r8/3-55836c7a.jpg'),
    ('Canon EOS R8', 4, '/products/canon-eos-r8/4-8ca8e4b6.jpg'),
    ('Canon EOS R8', 5, '/products/canon-eos-r8/5-c3b4a5a0.jpg'),
    ('Canon EOS R50', 0, '/products/canon-eos-r50/0-93babe5c.jpg'),
    ('Canon EOS R50', 1, '/products/canon-eos-r50/1-f427af4b.jpg'),
    ('Canon EOS R50', 2, '/products/canon-eos-r50/2-9e1ee5b6.jpg'),
    ('Canon EOS R50', 3, '/products/canon-eos-r50/3-4cba92bf.jpg'),
    ('Canon EOS R50', 4, '/products/canon-eos-r50/4-61d9436f.jpg'),
    ('Canon EOS R50', 5, '/products/canon-eos-r50/5-04944c9f.jpg'),
    ('Canon RF 50mm F1.8 STM', 0, '/products/canon-rf-50mm-f1-8-stm/0-fdf4caf9.jpg'),
    ('Canon RF 50mm F1.8 STM', 1, '/products/canon-rf-50mm-f1-8-stm/1-78ca499f.jpg'),
    ('Canon RF 50mm F1.8 STM', 2, '/products/canon-rf-50mm-f1-8-stm/2-4e39a7ab.jpg'),
    ('Canon RF 50mm F1.8 STM', 3, '/products/canon-rf-50mm-f1-8-stm/3-41aa66c3.jpg'),
    ('Canon RF 50mm F1.8 STM', 4, '/products/canon-rf-50mm-f1-8-stm/4-607b2388.jpg'),
    ('Canon RF 24-105mm F4-7.1 IS STM', 0, '/products/canon-rf-24-105mm-f4-7-1-is-stm/0-576cee24.jpg'),
    ('Canon RF 24-105mm F4-7.1 IS STM', 1, '/products/canon-rf-24-105mm-f4-7-1-is-stm/1-82e7b7b6.jpg'),
    ('Canon RF 24-105mm F4-7.1 IS STM', 2, '/products/canon-rf-24-105mm-f4-7-1-is-stm/2-1a0c3b49.jpg'),
    ('Canon RF 24-105mm F4-7.1 IS STM', 3, '/products/canon-rf-24-105mm-f4-7-1-is-stm/3-10c96aa4.jpg'),
    ('Canon RF 24-105mm F4-7.1 IS STM', 4, '/products/canon-rf-24-105mm-f4-7-1-is-stm/4-0284dfa2.jpg'),
    ('Pin Canon LP-E6NH', 0, '/products/pin-canon-lp-e6nh/0-b5a55272.jpg'),
    ('Pin Canon LP-E6NH', 1, '/products/pin-canon-lp-e6nh/1-afd0af30.jpg'),
    ('Pin Canon LP-E6NH', 2, '/products/pin-canon-lp-e6nh/2-61dda452.jpg'),
    ('Pin Canon LP-E17', 0, '/products/pin-canon-lp-e17/0-7e7fe1ba.jpg'),
    ('Nikon Z6 II', 0, '/products/nikon-z6-ii/0-01a19ea8.jpg'),
    ('Nikon Z6 II', 1, '/products/nikon-z6-ii/1-9c455f54.jpg'),
    ('Nikon Z6 II', 2, '/products/nikon-z6-ii/2-333274b2.jpg'),
    ('Nikon Z6 II', 3, '/products/nikon-z6-ii/3-6c191232.jpg'),
    ('Nikon Z6 II', 4, '/products/nikon-z6-ii/4-f041077d.jpg'),
    ('Nikon Z5 II', 0, '/products/nikon-z5-ii/0-ef8320ea.jpg'),
    ('Nikon Z5 II', 1, '/products/nikon-z5-ii/1-1c460d7b.jpg'),
    ('Nikon Z5 II', 2, '/products/nikon-z5-ii/2-6c6abd92.jpg'),
    ('Nikon Z5 II', 3, '/products/nikon-z5-ii/3-d460ffe5.jpg'),
    ('Nikon Z50 II', 0, '/products/nikon-z50-ii/0-0eec01ab.jpg'),
    ('Nikon Z50 II', 1, '/products/nikon-z50-ii/1-5599a193.jpg'),
    ('Nikon Z50 II', 2, '/products/nikon-z50-ii/2-2507e1db.jpg'),
    ('Nikon Z50 II', 3, '/products/nikon-z50-ii/3-b2ed405f.jpg'),
    ('Nikon Z50 II', 4, '/products/nikon-z50-ii/4-97065c24.jpg'),
    ('Nikon Z50 II', 5, '/products/nikon-z50-ii/5-e5f3fb11.jpg'),
    ('Nikon Z 24-105mm f/4-7.1', 0, '/products/nikon-z-24-105mm-f-4-7-1/0-16963f56.jpg'),
    ('Nikon Z 24-105mm f/4-7.1', 1, '/products/nikon-z-24-105mm-f-4-7-1/1-a95df9e8.jpg'),
    ('Nikon Z 24-105mm f/4-7.1', 2, '/products/nikon-z-24-105mm-f-4-7-1/2-26423edb.jpg'),
    ('Nikon Z 70-200mm f/2.8 VR S II', 0, '/products/nikon-z-70-200mm-f-2-8-vr-s-ii/0-ddee77ee.jpg'),
    ('Nikon Z 70-200mm f/2.8 VR S II', 1, '/products/nikon-z-70-200mm-f-2-8-vr-s-ii/1-3d51d331.jpg'),
    ('Nikon Z 70-200mm f/2.8 VR S II', 2, '/products/nikon-z-70-200mm-f-2-8-vr-s-ii/2-ec9d8d88.jpg'),
    ('Fujifilm X-T5', 0, '/products/fujifilm-x-t5/0-deb0994b.jpg'),
    ('Fujifilm X-T5', 1, '/products/fujifilm-x-t5/1-d292b898.jpg'),
    ('Fujifilm X-T5', 2, '/products/fujifilm-x-t5/2-76eb0245.jpg'),
    ('Fujifilm X-T5', 3, '/products/fujifilm-x-t5/3-25be962a.jpg'),
    ('Fujifilm X-T5', 4, '/products/fujifilm-x-t5/4-73f8f594.jpg'),
    ('Fujifilm X-S20', 0, '/products/fujifilm-x-s20/0-2db7d3d5.jpg'),
    ('Fujifilm X-S20', 1, '/products/fujifilm-x-s20/1-79fa17d2.jpg'),
    ('Fujifilm X-S20', 2, '/products/fujifilm-x-s20/2-baeceaec.jpg'),
    ('Fujifilm X-S20', 3, '/products/fujifilm-x-s20/3-709047be.jpg'),
    ('Fujifilm X-S20', 4, '/products/fujifilm-x-s20/4-ec2f9ba6.jpg'),
    ('Fujifilm X-S20', 5, '/products/fujifilm-x-s20/5-ad691f44.jpg'),
    ('Fujifilm X100VI', 0, '/products/fujifilm-x100vi/0-2329cb46.jpg'),
    ('Fujifilm X100VI', 1, '/products/fujifilm-x100vi/1-bbb9fe7f.jpg'),
    ('Fujifilm X100VI', 2, '/products/fujifilm-x100vi/2-023d99b6.jpg'),
    ('Fujifilm X100VI', 3, '/products/fujifilm-x100vi/3-3bb23000.jpg'),
    ('Fujifilm X100VI', 4, '/products/fujifilm-x100vi/4-0ad442bb.jpg'),
    ('Fujifilm X100VI', 5, '/products/fujifilm-x100vi/5-1c4383b9.jpg'),
    ('Fujifilm XF 35mm F1.4 R', 0, '/products/fujifilm-xf-35mm-f1-4-r/0-0023db0f.jpg'),
    ('Fujifilm XF 35mm F1.4 R', 1, '/products/fujifilm-xf-35mm-f1-4-r/1-f962b334.jpg'),
    ('Fujifilm XF 35mm F1.4 R', 2, '/products/fujifilm-xf-35mm-f1-4-r/2-48fd5933.jpg'),
    ('Fujifilm XF 35mm F1.4 R', 3, '/products/fujifilm-xf-35mm-f1-4-r/3-56a09c45.jpg'),
    ('Fujifilm XF 35mm F1.4 R', 4, '/products/fujifilm-xf-35mm-f1-4-r/4-4326586d.jpg'),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 0, '/products/fujifilm-xf-18-55mm-f2-8-4-r-lm-ois/0-735c2266.jpg'),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 1, '/products/fujifilm-xf-18-55mm-f2-8-4-r-lm-ois/1-9f4e0c3e.jpg'),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 2, '/products/fujifilm-xf-18-55mm-f2-8-4-r-lm-ois/2-0b0bef16.jpg'),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 3, '/products/fujifilm-xf-18-55mm-f2-8-4-r-lm-ois/3-3b3a24e9.jpg'),
    ('Fujifilm XF 18-55mm F2.8-4 R LM OIS', 4, '/products/fujifilm-xf-18-55mm-f2-8-4-r-lm-ois/4-40df9987.jpg'),
    ('Pin Fujifilm NP-W235', 0, '/products/pin-fujifilm-np-w235/0-6996fdf7.jpg'),
    ('Pin Fujifilm NP-W235', 1, '/products/pin-fujifilm-np-w235/1-2369beda.jpg'),
    ('Pin Fujifilm NP-W235', 2, '/products/pin-fujifilm-np-w235/2-87e1e2be.jpg'),
    ('Pin Fujifilm NP-W126S', 0, '/products/pin-fujifilm-np-w126s/0-440e69ac.jpg'),
    ('Pin Fujifilm NP-W126S', 1, '/products/pin-fujifilm-np-w126s/1-6aba910c.jpg'),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-II', 0, '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-ii/0-b3f91a6d.jpg'),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-II', 1, '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-ii/1-0880ab62.jpg'),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-I', 0, '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-i/0-42bbce96.jpg'),
    ('Thẻ nhớ SanDisk Extreme PRO SDXC UHS-I', 1, '/products/the-nho-sandisk-extreme-pro-sdxc-uhs-i/1-8d6dd219.jpg')
) AS v(name, sort_order, url)
JOIN products p ON p.name = v.name;
