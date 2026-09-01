-- Coupon codes are validated server-side. They must not be enumerable by anonymous
-- visitors or regular authenticated customers through the Supabase client.
REVOKE SELECT ON public.coupons FROM anon;

DROP POLICY IF EXISTS "public read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "auth read coupons" ON public.coupons;

-- The existing "admins manage coupons" policy continues to allow admin access.
