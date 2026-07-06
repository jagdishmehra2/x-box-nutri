create or replace function public.set_product_slug_if_missing()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 2;
begin
  if new.slug is not null and btrim(new.slug) <> '' then
    return new;
  end if;

  base_slug := trim(
    both '-' from regexp_replace(lower(coalesce(new.name, '')), '[^a-z0-9]+', '-', 'g')
  );

  if base_slug = '' then
    base_slug := 'product';
  end if;

  candidate_slug := base_slug;

  while exists (
    select 1
    from public.products
    where slug = candidate_slug
      and id <> new.id
  ) loop
    candidate_slug := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.slug := candidate_slug;
  return new;
end;
$$;

drop trigger if exists set_product_slug_if_missing on public.products;

create trigger set_product_slug_if_missing
before insert or update of name, slug on public.products
for each row
when (new.slug is null or btrim(new.slug) = '')
execute function public.set_product_slug_if_missing();

update public.products
set slug = null
where slug is null or btrim(slug) = '';
