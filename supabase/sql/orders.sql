create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_amount numeric(10, 2) not null,
  payment_status text not null default 'paid' check (payment_status in ('pending', 'paid', 'failed')),
  order_status text not null default 'processing' check (order_status in ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  razorpay_payment_id text not null,
  razorpay_order_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create unique index if not exists idx_orders_razorpay_payment_id on public.orders(razorpay_payment_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "users_can_read_own_orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users_can_insert_own_orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users_can_read_own_order_items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "users_can_insert_own_order_items"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );
