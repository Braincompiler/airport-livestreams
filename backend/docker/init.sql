-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE
    IF NOT EXISTS airports (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        icao VARCHAR(7) NOT NULL,
        type VARCHAR(14) NOT NULL,
        name VARCHAR(255) NOT NULL,
        latitude real NOT NULL,
        longitude real NOT NULL,
        elevation integer NULL,
        continent CHAR(2) NOT NULL,
        iso_country CHAR(2) NOT NULL,
        iso_region VARCHAR(7) NOT NULL,
        municipality VARCHAR(128) NULL,
        iata CHAR(3) NULL,
        home_link VARCHAR(255) NULL,
        wikipedia_link VARCHAR(255) NULL,
        --
        source_id integer NOT NULL
    );

CREATE INDEX idx_airports_icao ON airports (icao);

CREATE INDEX idx_airports_iata ON airports (iata);

CREATE INDEX idx_airports_type ON airports (type);

CREATE INDEX idx_airports_iso_country ON airports (iso_country);

CREATE INDEX idx_airports_iso_region ON airports (iso_region);

CREATE INDEX idx_airports_continent ON airports (continent);

CREATE INDEX idx_airports_source_id ON airports USING HASH (source_id);

CREATE TABLE
    IF NOT EXISTS countries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        code CHAR(2) NOT NULL,
        name VARCHAR(128) NOT NULL,
        continent CHAR(2) NOT NULL,
        wikipedia_link VARCHAR(255) NULL,
        --
        source_id integer NOT NULL
    );

CREATE INDEX idx_countries_code ON countries (code);

CREATE INDEX idx_countries_continent ON countries (continent);

CREATE INDEX idx_countries_source_id ON countries USING HASH (source_id);

CREATE TABLE
    IF NOT EXISTS regions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        code VARCHAR(7) NOT NULL,
        name VARCHAR(128) NOT NULL,
        continent CHAR(2) NOT NULL,
        iso_country CHAR(2) NOT NULL,
        wikipedia_link VARCHAR(255) NULL,
        --
        source_id integer NOT NULL
    );

CREATE INDEX idx_regions_code ON regions (code);

CREATE INDEX idx_regions_iso_country ON regions (iso_country);

CREATE INDEX idx_regions_source_id ON regions USING HASH (source_id);
