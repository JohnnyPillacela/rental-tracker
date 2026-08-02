begin;

-- =========================================================
-- ENUMS
-- =========================================================

create type public.property_status as enum (
  'active',
  'inactive',
  'sold'
);

create type public.rental_space_type as enum (
  'whole_unit',
  'room'
);

create type public.rent_status as enum (
  'occupied',
  'vacant',
  'partial_month',
  'nonpaying'
);


-- =========================================================
-- PROPERTIES
-- One row represents one physical house/building.
-- =========================================================

create table public.properties (
  id bigint generated always as identity primary key,

  user_id uuid not null
    default auth.uid()
    references auth.users(id)
    on delete cascade,

  nickname text not null,
  street_address text not null,
  city text not null,
  state text not null,
  zip_code text not null,

  purchase_price numeric(12, 2),

  status public.property_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint properties_nickname_not_blank
    check (length(trim(nickname)) > 0),

  constraint properties_street_address_not_blank
    check (length(trim(street_address)) > 0),

  constraint properties_city_not_blank
    check (length(trim(city)) > 0),

  constraint properties_state_not_blank
    check (length(trim(state)) > 0),

  constraint properties_zip_code_not_blank
    check (length(trim(zip_code)) > 0),

  constraint properties_purchase_price_nonnegative
    check (
      purchase_price is null
      or purchase_price >= 0
    )
);

create index properties_user_id_idx
  on public.properties(user_id);


-- =========================================================
-- UNITS
-- Apartments or other physical units inside a property.
-- Examples: First Floor, Unit 2, Basement.
-- =========================================================

create table public.units (
  id bigint generated always as identity primary key,

  property_id bigint not null
    references public.properties(id)
    on delete cascade,

  name text not null,

  display_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint units_name_not_blank
    check (length(trim(name)) > 0),

  constraint units_display_order_nonnegative
    check (display_order >= 0),

  -- Required for the composite foreign key used by
  -- utility_account_units.
  constraint units_id_property_id_unique
    unique (id, property_id)
);

create index units_property_id_idx
  on public.units(property_id);

-- Prevent "Second Floor" and "second floor" from being added
-- as separate units under the same property.
create unique index units_property_name_unique_idx
  on public.units(property_id, lower(name));


-- =========================================================
-- RENTAL SPACES
-- Represents the exact space for which rent is collected.
--
-- A space can represent:
--   - an entire apartment
--   - an individual room
--
-- Historical spaces are closed with end_month, not deleted.
-- start_month and end_month are inclusive.
-- =========================================================

create table public.rental_spaces (
  id bigint generated always as identity primary key,

  unit_id bigint not null
    references public.units(id)
    on delete cascade,

  name text not null,

  space_type public.rental_space_type not null,

  start_month date not null,
  end_month date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint rental_spaces_name_not_blank
    check (length(trim(name)) > 0),

  constraint rental_spaces_start_month_first_day
    check (
      start_month = date_trunc('month', start_month)::date
    ),

  constraint rental_spaces_end_month_first_day
    check (
      end_month is null
      or end_month = date_trunc('month', end_month)::date
    ),

  constraint rental_spaces_valid_period
    check (
      end_month is null
      or end_month >= start_month
    )
);

create index rental_spaces_unit_id_idx
  on public.rental_spaces(unit_id);

create index rental_spaces_active_period_idx
  on public.rental_spaces(unit_id, start_month, end_month);


-- =========================================================
-- MONTHLY RENT RECORDS
-- One record per rental space per calendar month.
-- =========================================================

create table public.monthly_rent_records (
  id bigint generated always as identity primary key,

  rental_space_id bigint not null
    references public.rental_spaces(id)
    on delete cascade,

  month date not null,

  expected_amount numeric(12, 2) not null,
  collected_amount numeric(12, 2) not null default 0,

  status public.rent_status not null,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint monthly_rent_month_first_day
    check (
      month = date_trunc('month', month)::date
    ),

  constraint monthly_rent_expected_nonnegative
    check (expected_amount >= 0),

  constraint monthly_rent_collected_nonnegative
    check (collected_amount >= 0),

  constraint monthly_rent_space_month_unique
    unique (rental_space_id, month)
);


-- =========================================================
-- UTILITY CATEGORIES
-- Preset categories controlled by migrations.
-- Users will not be able to create arbitrary categories.
-- =========================================================

create table public.utility_categories (
  id smallint generated always as identity primary key,

  code text not null unique,
  display_name text not null unique,
  display_order smallint not null,

  constraint utility_categories_code_not_blank
    check (length(trim(code)) > 0),

  constraint utility_categories_display_name_not_blank
    check (length(trim(display_name)) > 0),

  constraint utility_categories_display_order_nonnegative
    check (display_order >= 0)
);

insert into public.utility_categories (
  code,
  display_name,
  display_order
)
values
  ('electric', 'Electric', 10),
  ('gas',      'Gas',      20),
  ('water',    'Water',    30),
  ('internet', 'Internet', 40),
  ('trash',    'Trash',    50);


-- =========================================================
-- UTILITY ACCOUNTS
-- One row per owner-paid account, meter, or bill.
--
-- Examples:
--   Water - Main House
--   Electric - Second Floor
--   Electric - Third Floor and Basement
--
-- start_month and end_month are inclusive.
-- =========================================================

create table public.utility_accounts (
  id bigint generated always as identity primary key,

  property_id bigint not null
    references public.properties(id)
    on delete cascade,

  utility_category_id smallint not null
    references public.utility_categories(id)
    on delete restrict,

  name text not null,

  start_month date not null,
  end_month date,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint utility_accounts_name_not_blank
    check (length(trim(name)) > 0),

  constraint utility_accounts_start_month_first_day
    check (
      start_month = date_trunc('month', start_month)::date
    ),

  constraint utility_accounts_end_month_first_day
    check (
      end_month is null
      or end_month = date_trunc('month', end_month)::date
    ),

  constraint utility_accounts_valid_period
    check (
      end_month is null
      or end_month >= start_month
    ),

  -- Required for the composite foreign key used by
  -- utility_account_units.
  constraint utility_accounts_id_property_id_unique
    unique (id, property_id)
);

create index utility_accounts_property_id_idx
  on public.utility_accounts(property_id);

create index utility_accounts_category_id_idx
  on public.utility_accounts(utility_category_id);


-- =========================================================
-- UTILITY ACCOUNT UNITS
--
-- Links utility accounts to the units they serve.
--
-- No rows for an account:
--   The utility applies to the entire property.
--
-- One row:
--   The utility applies to one unit.
--
-- Multiple rows:
--   The utility applies to several units.
--
-- property_id is repeated here so the foreign keys can
-- guarantee that the account and units belong to the same
-- property.
-- =========================================================

create table public.utility_account_units (
  utility_account_id bigint not null,
  unit_id bigint not null,
  property_id bigint not null,

  created_at timestamptz not null default now(),

  primary key (utility_account_id, unit_id),

  constraint utility_account_units_account_fk
    foreign key (utility_account_id, property_id)
    references public.utility_accounts(id, property_id)
    on delete cascade,

  constraint utility_account_units_unit_fk
    foreign key (unit_id, property_id)
    references public.units(id, property_id)
    on delete cascade
);

create index utility_account_units_unit_id_idx
  on public.utility_account_units(unit_id);

create index utility_account_units_property_id_idx
  on public.utility_account_units(property_id);


-- =========================================================
-- MONTHLY UTILITY BILLS
-- One bill per utility account per calendar month.
-- =========================================================

create table public.monthly_utility_bills (
  id bigint generated always as identity primary key,

  utility_account_id bigint not null
    references public.utility_accounts(id)
    on delete cascade,

  month date not null,

  amount numeric(12, 2) not null,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint monthly_utility_bills_month_first_day
    check (
      month = date_trunc('month', month)::date
    ),

  constraint monthly_utility_bills_amount_nonnegative
    check (amount >= 0),

  constraint monthly_utility_bills_account_month_unique
    unique (utility_account_id, month)
);


-- =========================================================
-- MORTGAGE PERIODS
--
-- Stores the scheduled mortgage payment and interest rate
-- that applied during a specific range of months.
--
-- start_month and end_month are inclusive.
-- A null end_month means the period is still active.
-- =========================================================

create table public.mortgage_periods (
  id bigint generated always as identity primary key,

  property_id bigint not null
    references public.properties(id)
    on delete cascade,

  name text not null,

  lender text,

  start_month date not null,
  end_month date,

  interest_rate numeric(7, 4),

  scheduled_payment numeric(12, 2) not null,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mortgage_periods_name_not_blank
    check (length(trim(name)) > 0),

  constraint mortgage_periods_lender_not_blank
    check (
      lender is null
      or length(trim(lender)) > 0
    ),

  constraint mortgage_periods_start_month_first_day
    check (
      start_month = date_trunc('month', start_month)::date
    ),

  constraint mortgage_periods_end_month_first_day
    check (
      end_month is null
      or end_month = date_trunc('month', end_month)::date
    ),

  constraint mortgage_periods_valid_period
    check (
      end_month is null
      or end_month >= start_month
    ),

  constraint mortgage_periods_interest_rate_valid
    check (
      interest_rate is null
      or (
        interest_rate >= 0
        and interest_rate <= 100
      )
    ),

  constraint mortgage_periods_payment_nonnegative
    check (scheduled_payment >= 0)
);

create index mortgage_periods_property_id_idx
  on public.mortgage_periods(property_id);

create index mortgage_periods_active_period_idx
  on public.mortgage_periods(
    property_id,
    start_month,
    end_month
  );


-- =========================================================
-- UPDATED_AT TRIGGER
-- Automatically updates updated_at whenever a row changes.
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

create trigger units_set_updated_at
before update on public.units
for each row
execute function public.set_updated_at();

create trigger rental_spaces_set_updated_at
before update on public.rental_spaces
for each row
execute function public.set_updated_at();

create trigger monthly_rent_records_set_updated_at
before update on public.monthly_rent_records
for each row
execute function public.set_updated_at();

create trigger utility_accounts_set_updated_at
before update on public.utility_accounts
for each row
execute function public.set_updated_at();

create trigger monthly_utility_bills_set_updated_at
before update on public.monthly_utility_bills
for each row
execute function public.set_updated_at();

create trigger mortgage_periods_set_updated_at
before update on public.mortgage_periods
for each row
execute function public.set_updated_at();


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.rental_spaces enable row level security;
alter table public.monthly_rent_records enable row level security;
alter table public.utility_categories enable row level security;
alter table public.utility_accounts enable row level security;
alter table public.utility_account_units enable row level security;
alter table public.monthly_utility_bills enable row level security;
alter table public.mortgage_periods enable row level security;

-- =========================================================
-- PROPERTIES RLS
-- Directly compare the property owner to auth.uid().
-- =========================================================

create policy "users_manage_own_properties"
on public.properties
for all
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


-- =========================================================
-- UNITS RLS
-- A user may access a unit only through their own property.
-- =========================================================

create policy "users_manage_units_for_own_properties"
on public.units
for all
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = units.property_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.properties
    where properties.id = units.property_id
      and properties.user_id = (select auth.uid())
  )
);


-- =========================================================
-- RENTAL SPACES RLS
-- Ownership path:
-- rental_space -> unit -> property -> user
-- =========================================================

create policy "users_manage_rental_spaces_for_own_properties"
on public.rental_spaces
for all
to authenticated
using (
  exists (
    select 1
    from public.units
    join public.properties
      on properties.id = units.property_id
    where units.id = rental_spaces.unit_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.units
    join public.properties
      on properties.id = units.property_id
    where units.id = rental_spaces.unit_id
      and properties.user_id = (select auth.uid())
  )
);


-- =========================================================
-- MONTHLY RENT RLS
-- Ownership path:
-- rent record -> rental space -> unit -> property -> user
-- =========================================================

create policy "users_manage_rent_records_for_own_properties"
on public.monthly_rent_records
for all
to authenticated
using (
  exists (
    select 1
    from public.rental_spaces
    join public.units
      on units.id = rental_spaces.unit_id
    join public.properties
      on properties.id = units.property_id
    where rental_spaces.id =
      monthly_rent_records.rental_space_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rental_spaces
    join public.units
      on units.id = rental_spaces.unit_id
    join public.properties
      on properties.id = units.property_id
    where rental_spaces.id =
      monthly_rent_records.rental_space_id
      and properties.user_id = (select auth.uid())
  )
);


-- =========================================================
-- UTILITY CATEGORIES RLS
-- Authenticated users can read the preset categories.
-- They cannot modify them through the application.
-- =========================================================

create policy "authenticated_users_read_utility_categories"
on public.utility_categories
for select
to authenticated
using (true);


-- =========================================================
-- UTILITY ACCOUNTS RLS
-- Ownership path:
-- utility account -> property -> user
-- =========================================================

create policy "users_manage_utility_accounts_for_own_properties"
on public.utility_accounts
for all
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = utility_accounts.property_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.properties
    where properties.id = utility_accounts.property_id
      and properties.user_id = (select auth.uid())
  )
);


-- =========================================================
-- UTILITY ACCOUNT UNIT LINKS RLS
-- Ownership path:
-- account-unit link -> property -> user
-- =========================================================

create policy "users_manage_utility_unit_links_for_own_properties"
on public.utility_account_units
for all
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id =
      utility_account_units.property_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.properties
    where properties.id =
      utility_account_units.property_id
      and properties.user_id = (select auth.uid())
  )
);


-- =========================================================
-- MONTHLY UTILITY BILLS RLS
-- Ownership path:
-- utility bill -> utility account -> property -> user
-- =========================================================

create policy "users_manage_utility_bills_for_own_properties"
on public.monthly_utility_bills
for all
to authenticated
using (
  exists (
    select 1
    from public.utility_accounts
    join public.properties
      on properties.id = utility_accounts.property_id
    where utility_accounts.id =
      monthly_utility_bills.utility_account_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.utility_accounts
    join public.properties
      on properties.id = utility_accounts.property_id
    where utility_accounts.id =
      monthly_utility_bills.utility_account_id
      and properties.user_id = (select auth.uid())
  )
);



create policy "users_manage_mortgage_periods_for_own_properties"
on public.mortgage_periods
for all
to authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = mortgage_periods.property_id
      and properties.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.properties
    where properties.id = mortgage_periods.property_id
      and properties.user_id = (select auth.uid())
  )
);


-- =========================================================
-- TABLE PRIVILEGES
--
-- RLS decides which rows the authenticated user may access.
-- Grants decide which table operations the role may attempt.
-- =========================================================

revoke all privileges
on table
  public.properties,
  public.units,
  public.rental_spaces,
  public.monthly_rent_records,
  public.utility_categories,
  public.utility_accounts,
  public.utility_account_units,
  public.monthly_utility_bills,
  public.mortgage_periods
from anon;

grant usage on schema public to authenticated;

grant select
on table public.utility_categories
to authenticated;

grant select, insert, update, delete
on table
  public.properties,
  public.units,
  public.rental_spaces,
  public.monthly_rent_records,
  public.utility_accounts,
  public.utility_account_units,
  public.monthly_utility_bills,
  public.mortgage_periods
to authenticated;

grant usage, select
on sequence
  public.properties_id_seq,
  public.units_id_seq,
  public.rental_spaces_id_seq,
  public.monthly_rent_records_id_seq,
  public.utility_accounts_id_seq,
  public.monthly_utility_bills_id_seq,
  public.mortgage_periods_id_seq
to authenticated;

commit;