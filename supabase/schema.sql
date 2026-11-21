-- ShopMate - Supabase schema export (public schema)
-- Exported from live DB via SQL Editor queries on 2026-11-21.
-- Source: Query 1-4 results shared in chat; assembled into readable SQL.
--
-- Notes:
-- * This covers public schema objects returned by the export queries.
-- * `handle_new_user()` exists in public, but its trigger on `auth.users`
--   lives in the auth schema and was not included in Query 4 scope. Verify:
--     select tgname, pg_get_triggerdef(t.oid, true)
--     from pg_trigger t join pg_class c on c.oid=t.tgrelid
--     join pg_namespace n on n.oid=c.relnamespace
--     where n.nspname='auth' and not t.tgisinternal;
--   Expected pattern:
--     create trigger on_auth_user_created
--       after insert on auth.users
--       for each row execute function public.handle_new_user();
-- * `low_stock_products` view: doc expects security_invoker=true; verify with:
--     select relname, reloptions from pg_class c
--     join pg_namespace n on n.oid=c.relnamespace
--     where n.nspname='public' and c.relname='low_stock_products';
-- * Ordering is adjusted for readability/dependencies; this is a source-of-truth
--   snapshot, not a blindly-runnable migration on a fresh DB.

begin;

-- ---------------------------------------------------------------------------
-- Tables (base)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid not null,
  full_name text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.shops (
  id uuid not null default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  created_at timestamp with time zone not null default now()
);

-- ---------------------------------------------------------------------------
-- Functions required by table defaults / RLS
-- ---------------------------------------------------------------------------

create or replace function public.current_shop_id()
 returns uuid
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select id from public.shops where owner_id = auth.uid() limit 1
$function$;

-- ---------------------------------------------------------------------------
-- Tables (dependent)
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id uuid not null default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  low_stock_limit integer not null default 5,
  created_at timestamp with time zone not null default now(),
  shop_id uuid not null default current_shop_id()
);

create table if not exists public.sales (
  id uuid not null default gen_random_uuid(),
  shop_id uuid not null default current_shop_id(),
  total numeric(12,2) not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.sale_items (
  id uuid not null default gen_random_uuid(),
  sale_id uuid not null,
  product_id uuid,
  product_name text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);

-- ---------------------------------------------------------------------------
-- Constraints
-- ---------------------------------------------------------------------------

alter table public.profiles add constraint profiles_pkey primary key (id);
alter table public.profiles add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

alter table public.shops add constraint shops_pkey primary key (id);
alter table public.shops add constraint shops_owner_id_fkey
  foreign key (owner_id) references profiles(id) on delete cascade;

alter table public.products add constraint products_pkey primary key (id);
alter table public.products add constraint products_shop_id_fkey
  foreign key (shop_id) references shops(id) on delete cascade;
alter table public.products add constraint products_price_check check ((price > (0)::numeric));
alter table public.products add constraint products_stock_check check ((stock >= 0));
alter table public.products add constraint products_low_stock_limit_check check ((low_stock_limit >= 0));

alter table public.sales add constraint sales_pkey primary key (id);
alter table public.sales add constraint sales_shop_id_fkey
  foreign key (shop_id) references shops(id) on delete cascade;
alter table public.sales add constraint sales_total_check check ((total >= (0)::numeric));

alter table public.sale_items add constraint sale_items_pkey primary key (id);
alter table public.sale_items add constraint sale_items_sale_id_fkey
  foreign key (sale_id) references sales(id) on delete cascade;
alter table public.sale_items add constraint sale_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;
alter table public.sale_items add constraint sale_items_quantity_check check ((quantity > 0));
alter table public.sale_items add constraint sale_items_unit_price_check check ((unit_price >= (0)::numeric));

-- ---------------------------------------------------------------------------
-- Indexes (PK indexes are created by PK constraints; listed for completeness)
-- ---------------------------------------------------------------------------

-- create unique index products_pkey on public.products using btree (id);
-- create unique index profiles_pkey on public.profiles using btree (id);
-- create unique index sale_items_pkey on public.sale_items using btree (id);
-- create unique index sales_pkey on public.sales using btree (id);
-- create unique index shops_pkey on public.shops using btree (id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.sale_items enable row level security;
alter table public.sales enable row level security;
alter table public.shops enable row level security;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

create policy "shop products delete"
  on public.products
  as permissive
  for delete
  to authenticated
  using ((shop_id = current_shop_id()));

create policy "shop products insert"
  on public.products
  as permissive
  for insert
  to authenticated
  with check ((shop_id = current_shop_id()));

create policy "shop products read"
  on public.products
  as permissive
  for select
  to authenticated
  using ((shop_id = current_shop_id()));

create policy "shop products update"
  on public.products
  as permissive
  for update
  to authenticated
  using ((shop_id = current_shop_id()))
  with check ((shop_id = current_shop_id()));

create policy "own profile read"
  on public.profiles
  as permissive
  for select
  to public
  using ((id = auth.uid()));

create policy "own profile update"
  on public.profiles
  as permissive
  for update
  to public
  using ((id = auth.uid()));

create policy "shop sale_items read"
  on public.sale_items
  as permissive
  for select
  to authenticated
  using ((exists ( select 1
   from sales s
  where ((s.id = sale_items.sale_id) and (s.shop_id = current_shop_id())))));

create policy "shop sales read"
  on public.sales
  as permissive
  for select
  to authenticated
  using ((shop_id = current_shop_id()));

create policy "own shop read"
  on public.shops
  as permissive
  for select
  to public
  using ((owner_id = auth.uid()));

create policy "own shop update"
  on public.shops
  as permissive
  for update
  to public
  using ((owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------------

create or replace view public.low_stock_products as
 select id,
    name,
    stock,
    low_stock_limit
   from products
  where stock <= low_stock_limit;

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.shops (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'shop_name', 'My Shop'));

  return new;
end;
$function$;

create or replace function public.create_sale(items jsonb)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_shop uuid := public.current_shop_id();
  v_sale uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_prod public.products%rowtype;
  v_qty integer;
begin
  if v_shop is null then
    raise exception 'Shop nahi mili';
  end if;
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Sale mein kam az kam ek item chahiye';
  end if;

  insert into sales (shop_id, total) values (v_shop, 0)
  returning id into v_sale;

  for v_item in select * from jsonb_array_elements(items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Quantity sahi nahi';
    end if;

    -- row lock, taake do sales ek saath stock na bigaden
    select * into v_prod from products
    where id = (v_item->>'product_id')::uuid and shop_id = v_shop
    for update;

    if not found then
      raise exception 'Product nahi mila';
    end if;
    if v_prod.stock < v_qty then
      raise exception 'Stock kam hai: % (bacha: %)', v_prod.name, v_prod.stock;
    end if;

    update products set stock = stock - v_qty where id = v_prod.id;

    insert into sale_items (sale_id, product_id, product_name, quantity, unit_price)
    values (v_sale, v_prod.id, v_prod.name, v_qty, v_prod.price);

    v_total := v_total + v_prod.price * v_qty;
  end loop;

  update sales set total = v_total where id = v_sale;
  return v_sale;
end;
$function$;

create or replace function public.dashboard_stats()
 returns json
 language sql
 stable
 set search_path to 'public'
as $function$
  select json_build_object(
    'today_sales',
      coalesce((
        select sum(total) from sales
        where created_at >= date_trunc('day', now() at time zone 'Asia/Karachi')
                            at time zone 'Asia/Karachi'
      ), 0),
    'product_count', (select count(*) from products),
    'low_stock_count',
      (select count(*) from products where stock <= low_stock_limit)
  )
$function$;

commit;
