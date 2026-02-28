-- Schema-adaptive competition + discipline seed.
-- Works across legacy and cutover schemas:
-- - main.competitions OR main.events
-- - main.competition_disciplines OR main.event_competitions

DO $$
DECLARE
  competition_table text;
  discipline_table text;

  competition_name_col text;
  competition_location_col text;
  competition_date_col text;
  competition_type_col text;
  competition_slug_col text;
  competition_created_by_col text;
  competition_created_at_col text;
  competition_updated_at_col text;

  discipline_competition_id_col text;
  discipline_name_col text;
  discipline_name_normalized_col text;
  discipline_type_col text;
  discipline_created_at_col text;
  discipline_updated_at_col text;

  first_profile_id uuid;

  comp_row record;
  disc_row record;
  col record;
  enum_label text;
  dynamic_type_value text;
  existing_id uuid;
  generated_discipline_id uuid;
  discipline_normalized text;
  col_list text;
  val_list text;
  added_cols text[];
BEGIN
  CREATE TEMP TABLE _seed_competitions (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    location text NOT NULL,
    date_iso timestamptz NOT NULL,
    focus text NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO _seed_competitions (id, name, location, date_iso, focus) VALUES
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', 'Sunrise Trail Challenge', 'Brussels, Belgium', '2026-05-27', 'road'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'PK AC Dag 1', 'Merksem, Belgium', '2026-04-26', 'track'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'PK AC Dag 2', 'Merksem, Belgium', '2026-04-27', 'track'),
    ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', 'OM Diepenbeek', 'Diepenbeek, Belgium', '2026-04-21', 'track'),
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', 'PK Veldlopen', 'Leuven, Belgium', '2026-01-11', 'road'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', 'BK CadSch', 'Belgium', '2026-03-01', 'track');

  CREATE TEMP TABLE _seed_disciplines (
    competition_id uuid NOT NULL,
    discipline_name text NOT NULL,
    discipline_kind text NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO _seed_disciplines (competition_id, discipline_name, discipline_kind) VALUES
    -- Sunrise Trail Challenge
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', 'Road&Trail', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', 'Start line', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '1km', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '3km', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '5km', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '10km', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '15km', 'road'),
    ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', 'Finish line', 'road'),
    -- PK AC Dag 1
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'Track&Field', 'track'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '100m', 'track'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '200m', 'track'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '400m', 'track'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '800m', 'track'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '1500m', 'track'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'Long jump', 'field'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'High jump', 'field'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'Shot put', 'field'),
    ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'Javelin throw', 'field'),
    -- PK AC Dag 2
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'Track&Field', 'track'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', '100m hurdles', 'track'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', '200m', 'track'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', '400m', 'track'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', '3000m', 'track'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'Pole vault', 'field'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'Discus throw', 'field'),
    ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'Triple jump', 'field'),
    -- OM Diepenbeek
    ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', 'Track&Field', 'track'),
    ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', '60m', 'track'),
    ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', '400m', 'track'),
    ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', '800m', 'track'),
    ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', 'Shot put', 'field'),
    -- PK Veldlopen
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', 'Road&Trail', 'road'),
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', 'Start line', 'road'),
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', '1km', 'road'),
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', '3km', 'road'),
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', '5km', 'road'),
    ('a8f9f8e3-6fc5-47be-b146-68d83b6134aa', 'Finish line', 'road'),
    -- BK CadSch
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', 'Track&Field', 'track'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', '100m', 'track'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', '200m', 'track'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', '400m', 'track'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', '1500m', 'track'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', 'High jump', 'field'),
    ('7b5d053f-08c0-4fd2-9f29-2c0535f1720c', 'Long jump', 'field');

  SELECT id INTO first_profile_id
  FROM main.profiles
  ORDER BY created_at NULLS LAST, id
  LIMIT 1;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'main' AND table_name = 'competitions') THEN
    competition_table := 'competitions';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'main' AND table_name = 'events') THEN
    competition_table := 'events';
  ELSE
    RAISE EXCEPTION 'No main.competitions or main.events table found.';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'main' AND table_name = 'competition_disciplines') THEN
    discipline_table := 'competition_disciplines';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'main' AND table_name = 'event_competitions') THEN
    discipline_table := 'event_competitions';
  ELSE
    RAISE EXCEPTION 'No main.competition_disciplines or main.event_competitions table found.';
  END IF;

  SELECT column_name INTO competition_name_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table
    AND column_name IN ('competition_name', 'name', 'title', 'event_name', 'event_title')
  ORDER BY CASE column_name
    WHEN 'competition_name' THEN 1
    WHEN 'name' THEN 2
    WHEN 'title' THEN 3
    WHEN 'event_name' THEN 4
    WHEN 'event_title' THEN 5
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO competition_location_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table
    AND column_name IN ('competition_location', 'location', 'city', 'town', 'event_location')
  ORDER BY CASE column_name
    WHEN 'competition_location' THEN 1
    WHEN 'location' THEN 2
    WHEN 'city' THEN 3
    WHEN 'town' THEN 4
    WHEN 'event_location' THEN 5
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO competition_date_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table
    AND column_name IN ('competition_date', 'event_date', 'start_date', 'starts_at', 'start_time')
  ORDER BY CASE column_name
    WHEN 'competition_date' THEN 1
    WHEN 'event_date' THEN 2
    WHEN 'start_date' THEN 3
    WHEN 'starts_at' THEN 4
    WHEN 'start_time' THEN 5
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO competition_type_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table
    AND column_name IN ('competition_type', 'event_type', 'type')
  ORDER BY CASE column_name
    WHEN 'competition_type' THEN 1
    WHEN 'event_type' THEN 2
    WHEN 'type' THEN 3
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO competition_slug_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table
    AND column_name IN ('competition_slug', 'event_slug', 'slug')
  ORDER BY CASE column_name
    WHEN 'competition_slug' THEN 1
    WHEN 'event_slug' THEN 2
    WHEN 'slug' THEN 3
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO competition_created_by_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table
    AND column_name IN ('created_by_profile_id', 'owner_profile_id', 'author_profile_id')
  ORDER BY CASE column_name
    WHEN 'created_by_profile_id' THEN 1
    WHEN 'owner_profile_id' THEN 2
    WHEN 'author_profile_id' THEN 3
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO competition_created_at_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table AND column_name = 'created_at'
  LIMIT 1;

  SELECT column_name INTO competition_updated_at_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = competition_table AND column_name = 'updated_at'
  LIMIT 1;

  SELECT column_name INTO discipline_competition_id_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = discipline_table
    AND column_name IN ('competition_id', 'event_id')
  ORDER BY CASE column_name WHEN 'competition_id' THEN 1 ELSE 2 END
  LIMIT 1;

  SELECT column_name INTO discipline_name_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = discipline_table
    AND column_name IN ('discipline_name', 'competition_name', 'name', 'title')
  ORDER BY CASE column_name
    WHEN 'discipline_name' THEN 1
    WHEN 'competition_name' THEN 2
    WHEN 'name' THEN 3
    WHEN 'title' THEN 4
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO discipline_name_normalized_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = discipline_table
    AND column_name IN ('discipline_name_normalized', 'competition_name_normalized', 'name_normalized', 'title_normalized')
  ORDER BY CASE column_name
    WHEN 'discipline_name_normalized' THEN 1
    WHEN 'competition_name_normalized' THEN 2
    WHEN 'name_normalized' THEN 3
    WHEN 'title_normalized' THEN 4
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO discipline_type_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = discipline_table
    AND column_name IN ('discipline_type', 'competition_type', 'event_type', 'type')
  ORDER BY CASE column_name
    WHEN 'discipline_type' THEN 1
    WHEN 'competition_type' THEN 2
    WHEN 'event_type' THEN 3
    WHEN 'type' THEN 4
    ELSE 99
  END
  LIMIT 1;

  SELECT column_name INTO discipline_created_at_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = discipline_table AND column_name = 'created_at'
  LIMIT 1;

  SELECT column_name INTO discipline_updated_at_col
  FROM information_schema.columns
  WHERE table_schema = 'main' AND table_name = discipline_table AND column_name = 'updated_at'
  LIMIT 1;

  FOR comp_row IN SELECT * FROM _seed_competitions ORDER BY date_iso, name LOOP
    EXECUTE format('SELECT id FROM main.%I WHERE id = $1 LIMIT 1', competition_table)
      INTO existing_id
      USING comp_row.id;

    IF existing_id IS NULL THEN
      col_list := 'id';
      val_list := quote_literal(comp_row.id);
      added_cols := ARRAY['id'];

      IF competition_name_col IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_name_col);
        val_list := val_list || ', ' || quote_literal(comp_row.name);
        added_cols := array_append(added_cols, competition_name_col);
      END IF;

      IF competition_location_col IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_location_col);
        val_list := val_list || ', ' || quote_literal(comp_row.location);
        added_cols := array_append(added_cols, competition_location_col);
      END IF;

      IF competition_date_col IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_date_col);
        val_list := val_list || ', ' || quote_literal(comp_row.date_iso);
        added_cols := array_append(added_cols, competition_date_col);
      END IF;

      IF competition_type_col IS NOT NULL THEN
        SELECT data_type, udt_name INTO col
        FROM information_schema.columns
        WHERE table_schema = 'main' AND table_name = competition_table AND column_name = competition_type_col
        LIMIT 1;

        dynamic_type_value := CASE WHEN comp_row.focus = 'road' THEN 'road' ELSE 'track' END;
        IF col.data_type = 'USER-DEFINED' THEN
          SELECT e.enumlabel INTO enum_label
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = col.udt_name
          ORDER BY CASE
            WHEN comp_row.focus = 'road' AND lower(e.enumlabel) IN ('road_trail', 'road&trail', 'road', 'trail', 'cross') THEN 1
            WHEN comp_row.focus <> 'road' AND lower(e.enumlabel) IN ('track_field', 'track&field', 'track', 'field') THEN 1
            ELSE 99
          END, e.enumsortorder
          LIMIT 1;
          dynamic_type_value := COALESCE(enum_label, dynamic_type_value);
        END IF;

        col_list := col_list || ', ' || quote_ident(competition_type_col);
        val_list := val_list || ', ' || quote_literal(dynamic_type_value);
        added_cols := array_append(added_cols, competition_type_col);
      END IF;

      IF competition_slug_col IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_slug_col);
        val_list := val_list || ', ' || quote_literal(lower(regexp_replace(comp_row.name, '[^a-z0-9]+', '-', 'g')));
        added_cols := array_append(added_cols, competition_slug_col);
      END IF;

      IF competition_created_by_col IS NOT NULL AND first_profile_id IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_created_by_col);
        val_list := val_list || ', ' || quote_literal(first_profile_id);
        added_cols := array_append(added_cols, competition_created_by_col);
      END IF;

      IF competition_created_at_col IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_created_at_col);
        val_list := val_list || ', ' || quote_literal(now());
        added_cols := array_append(added_cols, competition_created_at_col);
      END IF;

      IF competition_updated_at_col IS NOT NULL THEN
        col_list := col_list || ', ' || quote_ident(competition_updated_at_col);
        val_list := val_list || ', ' || quote_literal(now());
        added_cols := array_append(added_cols, competition_updated_at_col);
      END IF;

      FOR col IN
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'main'
          AND table_name = competition_table
          AND is_nullable = 'NO'
          AND column_default IS NULL
      LOOP
        IF col.column_name = ANY(added_cols) THEN
          CONTINUE;
        END IF;

        col_list := col_list || ', ' || quote_ident(col.column_name);
        added_cols := array_append(added_cols, col.column_name);

        IF col.column_name = competition_created_by_col AND first_profile_id IS NOT NULL THEN
          val_list := val_list || ', ' || quote_literal(first_profile_id);
        ELSIF col.data_type = 'uuid' THEN
          val_list := val_list || ', ' || quote_literal(comp_row.id);
        ELSIF col.data_type IN ('timestamp with time zone', 'timestamp without time zone', 'date') THEN
          val_list := val_list || ', ' || quote_literal(now());
        ELSIF col.data_type = 'boolean' THEN
          val_list := val_list || ', false';
        ELSIF col.data_type IN ('integer', 'bigint', 'numeric', 'double precision', 'real') THEN
          val_list := val_list || ', 0';
        ELSIF col.data_type = 'jsonb' THEN
          val_list := val_list || ', ''{}''::jsonb';
        ELSIF col.data_type = 'USER-DEFINED' THEN
          SELECT e.enumlabel INTO enum_label
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = col.udt_name
          ORDER BY e.enumsortorder
          LIMIT 1;
          val_list := val_list || ', ' || quote_literal(COALESCE(enum_label, ''));
        ELSE
          val_list := val_list || ', ' || quote_literal('Seed');
        END IF;
      END LOOP;

      EXECUTE format('INSERT INTO main.%I (%s) VALUES (%s)', competition_table, col_list, val_list);
    END IF;
  END LOOP;

  FOR disc_row IN SELECT * FROM _seed_disciplines LOOP
    discipline_normalized := lower(regexp_replace(disc_row.discipline_name, '[^a-z0-9]+', '-', 'g'));
    existing_id := NULL;

    IF discipline_name_normalized_col IS NOT NULL AND discipline_competition_id_col IS NOT NULL THEN
      EXECUTE format(
        'SELECT id FROM main.%I WHERE %I = $1 AND %I = $2 LIMIT 1',
        discipline_table, discipline_competition_id_col, discipline_name_normalized_col
      ) INTO existing_id USING disc_row.competition_id, discipline_normalized;
    ELSIF discipline_name_col IS NOT NULL AND discipline_competition_id_col IS NOT NULL THEN
      EXECUTE format(
        'SELECT id FROM main.%I WHERE %I = $1 AND lower(%I) = lower($2) LIMIT 1',
        discipline_table, discipline_competition_id_col, discipline_name_col
      ) INTO existing_id USING disc_row.competition_id, disc_row.discipline_name;
    END IF;

    IF existing_id IS NOT NULL THEN
      CONTINUE;
    END IF;

    generated_discipline_id := gen_random_uuid();

    col_list := 'id';
    val_list := quote_literal(generated_discipline_id);
    added_cols := ARRAY['id'];

    IF discipline_competition_id_col IS NOT NULL THEN
      col_list := col_list || ', ' || quote_ident(discipline_competition_id_col);
      val_list := val_list || ', ' || quote_literal(disc_row.competition_id);
      added_cols := array_append(added_cols, discipline_competition_id_col);
    END IF;

    IF discipline_name_col IS NOT NULL THEN
      col_list := col_list || ', ' || quote_ident(discipline_name_col);
      val_list := val_list || ', ' || quote_literal(disc_row.discipline_name);
      added_cols := array_append(added_cols, discipline_name_col);
    END IF;

    IF discipline_name_normalized_col IS NOT NULL THEN
      col_list := col_list || ', ' || quote_ident(discipline_name_normalized_col);
      val_list := val_list || ', ' || quote_literal(discipline_normalized);
      added_cols := array_append(added_cols, discipline_name_normalized_col);
    END IF;

    IF discipline_type_col IS NOT NULL THEN
      SELECT data_type, udt_name INTO col
      FROM information_schema.columns
      WHERE table_schema = 'main' AND table_name = discipline_table AND column_name = discipline_type_col
      LIMIT 1;

      dynamic_type_value := disc_row.discipline_kind;
      IF col.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel INTO enum_label
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = col.udt_name
        ORDER BY CASE
          WHEN disc_row.discipline_kind = 'road' AND lower(e.enumlabel) IN ('road_trail', 'road&trail', 'road', 'trail', 'cross') THEN 1
          WHEN disc_row.discipline_kind = 'field' AND lower(e.enumlabel) IN ('field', 'track_field', 'track&field', 'track') THEN 1
          WHEN disc_row.discipline_kind = 'track' AND lower(e.enumlabel) IN ('track', 'track_field', 'track&field', 'field') THEN 1
          ELSE 99
        END, e.enumsortorder
        LIMIT 1;
        dynamic_type_value := COALESCE(enum_label, dynamic_type_value);
      END IF;

      col_list := col_list || ', ' || quote_ident(discipline_type_col);
      val_list := val_list || ', ' || quote_literal(dynamic_type_value);
      added_cols := array_append(added_cols, discipline_type_col);
    END IF;

    IF discipline_created_at_col IS NOT NULL THEN
      col_list := col_list || ', ' || quote_ident(discipline_created_at_col);
      val_list := val_list || ', ' || quote_literal(now());
      added_cols := array_append(added_cols, discipline_created_at_col);
    END IF;

    IF discipline_updated_at_col IS NOT NULL THEN
      col_list := col_list || ', ' || quote_ident(discipline_updated_at_col);
      val_list := val_list || ', ' || quote_literal(now());
      added_cols := array_append(added_cols, discipline_updated_at_col);
    END IF;

    FOR col IN
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'main'
        AND table_name = discipline_table
        AND is_nullable = 'NO'
        AND column_default IS NULL
    LOOP
      IF col.column_name = ANY(added_cols) THEN
        CONTINUE;
      END IF;

      col_list := col_list || ', ' || quote_ident(col.column_name);
      added_cols := array_append(added_cols, col.column_name);

      IF col.column_name = discipline_competition_id_col THEN
        val_list := val_list || ', ' || quote_literal(disc_row.competition_id);
      ELSIF col.data_type = 'uuid' THEN
        val_list := val_list || ', ' || quote_literal(generated_discipline_id);
      ELSIF col.data_type IN ('timestamp with time zone', 'timestamp without time zone', 'date') THEN
        val_list := val_list || ', ' || quote_literal(now());
      ELSIF col.data_type = 'boolean' THEN
        val_list := val_list || ', false';
      ELSIF col.data_type IN ('integer', 'bigint', 'numeric', 'double precision', 'real') THEN
        val_list := val_list || ', 0';
      ELSIF col.data_type = 'jsonb' THEN
        val_list := val_list || ', ''{}''::jsonb';
      ELSIF col.data_type = 'USER-DEFINED' THEN
        SELECT e.enumlabel INTO enum_label
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = col.udt_name
        ORDER BY e.enumsortorder
        LIMIT 1;
        val_list := val_list || ', ' || quote_literal(COALESCE(enum_label, ''));
      ELSE
        val_list := val_list || ', ' || quote_literal('Seed');
      END IF;
    END LOOP;

    EXECUTE format('INSERT INTO main.%I (%s) VALUES (%s)', discipline_table, col_list, val_list);
  END LOOP;

  RAISE NOTICE 'Seeded competitions and disciplines using %.% + %.%',
    'main', competition_table, 'main', discipline_table;
END $$;
