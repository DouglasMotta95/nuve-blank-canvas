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

create index if not exists banners_placement_active_sort_idx
  on public.banners (placement, active, sort_order);
create index if not exists product_images_product_active_sort_idx
  on public.product_images (product_id, active, sort_order);
