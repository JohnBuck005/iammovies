-- PayPal webhook subscription tracking
alter table public.subscriptions
  add column if not exists paypal_subscription_id text;

create index if not exists subscriptions_paypal_idx
  on public.subscriptions (paypal_subscription_id);
