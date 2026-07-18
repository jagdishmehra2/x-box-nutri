alter table public.orders
  add column if not exists shipping_charge numeric not null default 0;
