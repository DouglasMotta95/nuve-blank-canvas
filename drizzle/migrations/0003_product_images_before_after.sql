ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_before_after boolean NOT NULL DEFAULT false;

UPDATE public.product_images SET is_before_after = true
WHERE url LIKE '%img-20260831-wa0080.jpg' OR url LIKE '%img-20260831-wa0084.jpg';

INSERT INTO public.product_images (product_id, url, alt, sort_order, is_cover, is_before_after)
SELECT p.id, v.url, v.alt, v.sort_order, false, true
FROM (VALUES
  ('nuve-5-em-1', '/__l5e/assets-v1/a744a741-144d-46d4-a258-45bc37ddd62a/5em1-antes-depois.jpg', 'Antes e depois com NUVE 5 EM 1: pele mais uniforme e luminosa', 5),
  ('nuve-ghk-cu', '/__l5e/assets-v1/a4ce1e4a-4d51-4a5f-ad4a-9c07c13d8644/ghk-antes-depois.jpg', 'Antes e depois com NUVE GHK-Cu: pele mais firme, luminosa e jovem', 5),
  ('nuve-pdrn', '/__l5e/assets-v1/da2299b3-a76c-4fb7-8cca-93997ca3841f/pdrn-antes-depois.jpg', 'Antes e depois com NUVE PDRN Copper Peptide: linhas suavizadas', 4)
) AS v(slug, url, alt, sort_order)
JOIN public.products p ON p.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM public.product_images i WHERE i.product_id = p.id AND i.url = v.url);