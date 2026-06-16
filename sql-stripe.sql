-- Add Stripe columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;

-- Add commission columns to matches
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS commission_amount NUMERIC;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT FALSE;
