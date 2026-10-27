CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS dishes_name_trgm_idx
  ON dishes USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS dishes_search_fts_idx
  ON dishes USING gin (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  );

CREATE INDEX IF NOT EXISTS dishes_category_idx ON dishes (category);
CREATE INDEX IF NOT EXISTS dishes_price_idx ON dishes (price);
CREATE INDEX IF NOT EXISTS dishes_available_idx ON dishes (available);
