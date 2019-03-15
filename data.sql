CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    num_employees integer,
    description text,
    logo_url text
);

INSERT INTO companies
  VALUES ('app', 'Apple Inc', 1000),
         ('ibm', 'IBM', 2000),
         ('smg', 'Samsung', 3000),
         ('LG', 'Lifes Good', 4000),
         ('int', 'Intel', 5000),
         ('amd', 'AMD', 6000);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY ,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK(equity <= 1.0),
    company_handle text REFERENCES companies(handle) ON DELETE CASCADE,
    date_posted timestamp without time zone default CURRENT_TIMESTAMP
);

INSERT INTO jobs (title, salary, equity, company_handle)
  VALUES ('CEO', 160000.00, 0.8, 'int');

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT 'f' 

);

