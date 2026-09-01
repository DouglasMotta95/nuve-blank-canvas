-- Move the existing "A linha em detalhes" media into the CMS so the
-- storefront no longer depends on hardcoded React fallbacks.
-- Safe/idempotent: existing CMS rows are preserved and URLs are not duplicated.

insert into public.banners (
  title, subtitle, cta_label, cta_link,
  image_desktop, image_mobile, image_fit,
  sort_order, active, placement, alt_text
)
select v.title, null, null, null, v.url, null, 'contain', v.ord, true, 'line_details', v.alt
from (values
  ('Linha NUVE 01','/__l5e/assets-v1/2c9caabb-90bc-4101-91a2-8451df45fb1c/img-20260831-wa0065.jpg',1,'Séruns NUVE lado a lado'),
  ('Linha NUVE 02','/__l5e/assets-v1/c5d74fa1-5598-4358-8285-33697ec37b3b/img-20260831-wa0066.jpg',2,'Séruns NUVE com suas embalagens'),
  ('Linha NUVE 03','/__l5e/assets-v1/d4e028ed-1dd0-4a61-b65c-67e88d28103f/img-20260831-wa0073.jpg',3,'NUVE GHK-Cu e 5 EM 1 com caixas'),
  ('Linha NUVE 04','/__l5e/assets-v1/9e4a5285-4844-4db9-822c-e826dfd19eb2/img-20260831-wa0079.jpg',4,'NUVE 5 EM 1 com embalagem'),
  ('Linha NUVE 05','/__l5e/assets-v1/18ff057f-ec00-4217-aca6-035a6dd51cf0/img-20260831-wa0067.jpg',5,'NUVE PDRN com embalagem'),
  ('Linha NUVE 06','/__l5e/assets-v1/e75b11a6-e1e6-4f5e-974d-66d07ade286e/img-20260831-wa0078.jpg',6,'NUVE PDRN em composição rosa'),
  ('Linha NUVE 07','/__l5e/assets-v1/fb6e1956-dd3b-4cbe-8deb-7c377b55ee32/img-20260831-wa0081.jpg',7,'NUVE 5 EM 1 em fundo claro'),
  ('Linha NUVE 08','/__l5e/assets-v1/9310a703-8aba-496f-8544-071549952c48/img-20260831-wa0036.jpg',8,'NUVE 5 EM 1 Serum 30 ml'),
  ('Linha NUVE 09','/__l5e/assets-v1/39c7ba0d-033c-4b2c-8122-a851a2634dd5/img-20260831-wa0037.jpg',9,'Mulheres aplicando sérum NUVE')
) as v(title,url,ord,alt)
where not exists (
  select 1
  from public.banners b
  where b.placement = 'line_details'
    and b.image_desktop = v.url
);
