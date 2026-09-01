-- CMS controls for NUVE site content.
-- Safe, additive migration: existing data is preserved.

alter table public.banners
  add column if not exists placement text not null default 'hero',
  add column if not exists alt_text text;

alter table public.product_images
  add column if not exists active boolean not null default true;

-- Stop every active banner from being reused in the hero. Classify the
-- existing NUVE content by meaning first, then keep only the first remaining
-- banner as hero and treat other unmatched banners as editorial.
update public.banners
set placement = case
  when title ilike '%japão%' then 'japan'
  when title ilike '%ciência%' or title ilike '%tecnologia em cada fórmula%' then 'science'
  else placement
end
where placement = 'hero';

with remaining as (
  select id, row_number() over (order by sort_order, created_at, id) as rn
  from public.banners
  where placement = 'hero'
)
update public.banners b
set placement = case when r.rn = 1 then 'hero' else 'editorial' end
from remaining r
where b.id = r.id;

-- Give the About page its own editable media slot without taking an existing
-- Home image away. The client can replace this copy independently in admin.
insert into public.banners (
  title, subtitle, cta_label, cta_link, image_desktop, image_mobile,
  image_fit, sort_order, active, placement, alt_text
)
select
  'A marca NUVE', subtitle, null, null, image_desktop, image_mobile,
  image_fit, 1, true, 'about', 'NUVE Advance Skincare — imagem institucional'
from public.banners
where placement = 'editorial'
  and not exists (select 1 from public.banners where placement = 'about')
order by sort_order
limit 1;

create index if not exists banners_placement_active_sort_idx
  on public.banners (placement, active, sort_order);
create index if not exists product_images_product_active_sort_idx
  on public.product_images (product_id, active, sort_order);
