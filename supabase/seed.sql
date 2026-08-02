-- Local development seed data.
--
-- This user is only a placeholder owner for the seeded rows. It has no
-- password or identity record, so it cannot sign in through Supabase Auth.
insert into auth.users (
  id,
  email,
  raw_user_meta_data
)
values (
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'local-owner@example.com',
  '{}'::jsonb
)
on conflict (id) do nothing;


do $$
declare
  v_user_id constant uuid :=
    'd0e3c8f0-1234-5678-9abc-def012345678';

  v_property_id bigint;

  v_second_floor_id bigint;
  v_third_floor_id bigint;
  v_basement_id bigint;

  v_second_floor_space_id bigint;
  v_third_floor_whole_id bigint;
  v_third_floor_room_a_id bigint;
  v_third_floor_room_b_id bigint;
  v_basement_space_id bigint;

  v_water_category_id smallint;
  v_electric_category_id smallint;

  v_water_account_id bigint;
  v_second_floor_electric_id bigint;
  v_third_basement_electric_id bigint;
begin
  -- One physical property.
  insert into public.properties (
    user_id,
    nickname,
    street_address,
    city,
    state,
    zip_code,
    purchase_price,
    status
  )
  values (
    v_user_id,
    'Sample Three-Family',
    '123 Example Street',
    'Brooklyn',
    'NY',
    '11201',
    650000.00,
    'active'
  )
  returning id into v_property_id;

  -- Physical apartments/units inside the property.
  insert into public.units (
    property_id,
    name,
    display_order
  )
  values (
    v_property_id,
    'Second Floor',
    10
  )
  returning id into v_second_floor_id;

  insert into public.units (
    property_id,
    name,
    display_order
  )
  values (
    v_property_id,
    'Third Floor',
    20
  )
  returning id into v_third_floor_id;

  insert into public.units (
    property_id,
    name,
    display_order
  )
  values (
    v_property_id,
    'Basement',
    30
  )
  returning id into v_basement_id;

  -- Second floor and basement are rented as whole units.
  insert into public.rental_spaces (
    unit_id,
    name,
    space_type,
    start_month
  )
  values (
    v_second_floor_id,
    'Second Floor - Whole Apartment',
    'whole_unit',
    '2025-01-01'
  )
  returning id into v_second_floor_space_id;

  insert into public.rental_spaces (
    unit_id,
    name,
    space_type,
    start_month
  )
  values (
    v_basement_id,
    'Basement - Whole Apartment',
    'whole_unit',
    '2025-01-01'
  )
  returning id into v_basement_space_id;

  -- The third floor was originally rented as a whole apartment.
  insert into public.rental_spaces (
    unit_id,
    name,
    space_type,
    start_month,
    end_month
  )
  values (
    v_third_floor_id,
    'Third Floor - Whole Apartment',
    'whole_unit',
    '2025-01-01',
    '2025-06-01'
  )
  returning id into v_third_floor_whole_id;

  -- Beginning July 2025, the third floor is rented by room.
  insert into public.rental_spaces (
    unit_id,
    name,
    space_type,
    start_month
  )
  values (
    v_third_floor_id,
    'Third Floor - Room A',
    'room',
    '2025-07-01'
  )
  returning id into v_third_floor_room_a_id;

  insert into public.rental_spaces (
    unit_id,
    name,
    space_type,
    start_month
  )
  values (
    v_third_floor_id,
    'Third Floor - Room B',
    'room',
    '2025-07-01'
  )
  returning id into v_third_floor_room_b_id;

  -- Historical rent before the third floor changed to room rentals.
  insert into public.monthly_rent_records (
    rental_space_id,
    month,
    expected_amount,
    collected_amount,
    status,
    notes
  )
  values (
    v_third_floor_whole_id,
    '2025-06-01',
    2200.00,
    2200.00,
    'occupied',
    'Final month before switching the apartment to room rentals.'
  );

  -- February 2026 monthly rent examples.
  insert into public.monthly_rent_records (
    rental_space_id,
    month,
    expected_amount,
    collected_amount,
    status,
    notes
  )
  values
    (
      v_second_floor_space_id,
      '2026-02-01',
      2400.00,
      2400.00,
      'occupied',
      null
    ),
    (
      v_third_floor_room_a_id,
      '2026-02-01',
      1200.00,
      1200.00,
      'occupied',
      null
    ),
    (
      v_third_floor_room_b_id,
      '2026-02-01',
      1200.00,
      0.00,
      'vacant',
      'Room was vacant for the entire month.'
    ),
    (
      v_basement_space_id,
      '2026-02-01',
      1700.00,
      1500.00,
      'occupied',
      'Tenant paid $200 less than expected; balance remains outstanding.'
    );

  -- Look up the preset categories created by the migration.
  select id
  into v_water_category_id
  from public.utility_categories
  where code = 'water';

  select id
  into v_electric_category_id
  from public.utility_categories
  where code = 'electric';

  -- No unit links are added to this account, so it covers the
  -- entire property.
  insert into public.utility_accounts (
    property_id,
    utility_category_id,
    name,
    start_month,
    notes
  )
  values (
    v_property_id,
    v_water_category_id,
    'Water - Main House Account',
    '2025-01-01',
    'One owner-paid water account covers the entire property.'
  )
  returning id into v_water_account_id;

  -- One electric account covers only the second floor.
  insert into public.utility_accounts (
    property_id,
    utility_category_id,
    name,
    start_month
  )
  values (
    v_property_id,
    v_electric_category_id,
    'Electric - Second Floor',
    '2025-01-01'
  )
  returning id into v_second_floor_electric_id;

  insert into public.utility_account_units (
    utility_account_id,
    unit_id,
    property_id
  )
  values (
    v_second_floor_electric_id,
    v_second_floor_id,
    v_property_id
  );

  -- A second electric account covers both the third floor and basement.
  insert into public.utility_accounts (
    property_id,
    utility_category_id,
    name,
    start_month
  )
  values (
    v_property_id,
    v_electric_category_id,
    'Electric - Third Floor and Basement',
    '2025-01-01'
  )
  returning id into v_third_basement_electric_id;

  insert into public.utility_account_units (
    utility_account_id,
    unit_id,
    property_id
  )
  values
    (
      v_third_basement_electric_id,
      v_third_floor_id,
      v_property_id
    ),
    (
      v_third_basement_electric_id,
      v_basement_id,
      v_property_id
    );

  -- February 2026 owner-paid utility bills.
  insert into public.monthly_utility_bills (
    utility_account_id,
    month,
    amount,
    notes
  )
  values
    (
      v_water_account_id,
      '2026-02-01',
      185.40,
      'Whole-property water bill.'
    ),
    (
      v_second_floor_electric_id,
      '2026-02-01',
      132.15,
      null
    ),
    (
      v_third_basement_electric_id,
      '2026-02-01',
      248.70,
      'Combined third-floor and basement electric bill.'
    );

  -- Scheduled mortgage history. Previous amounts remain unchanged when
  -- a new effective period begins.
  insert into public.mortgage_periods (
    property_id,
    name,
    lender,
    start_month,
    end_month,
    interest_rate,
    scheduled_payment,
    notes
  )
  values
    (
      v_property_id,
      'Chase refinance',
      'Chase',
      '2025-01-01',
      '2026-04-01',
      6.2500,
      2500.00,
      'Scheduled payment after refinancing.'
    ),
    (
      v_property_id,
      'SCRA reduced rate',
      'Chase',
      '2026-05-01',
      '2026-11-01',
      4.0000,
      2100.00,
      'Temporary SCRA interest-rate reduction.'
    ),
    (
      v_property_id,
      'Post-SCRA restored rate',
      'Chase',
      '2026-12-01',
      null,
      6.2500,
      2500.00,
      'Scheduled payment after the temporary reduction ends.'
    );
end;
$$;
