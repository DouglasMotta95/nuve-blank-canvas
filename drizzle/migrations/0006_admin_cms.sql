-- CMS controls for NUVE site content.
-- Safe, additive migration: existing data is preserved.

alter table public.banners
  add column if not exists placement text not null default 'hero',
  add column if not exists alt_text text;

alter table public.product_images
  add column if not exists active boolean not null default true;

-- Preserve the current editorial intent while stopping every banner from
-- automatically being reused in the hero. Existing rows are classified by
-- their current sort order only once during migration.
with ranked as (
  select id, row_number() over (order by sort_order, created_at, id) as rn
  from public.banners
)
update public.banners b
set placement = case r.rn
  when 1 then 'hero'
  when 2 then 'japan'
  when 3 then 'science'
  else 'editorial'
end
from ranked r
where b.id = r.id
  and b.placement = 'hero';

create index if not exists banners_placement_active_sort_idx
  on public.banners (placement, active, sort_order);
create index if not exists product_images_product_active_sort_idx
  on public.product_images (product_id, active, sort_order);
