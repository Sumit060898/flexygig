const pg = require("pg");
require("dotenv").config();

const client = new pg.Client({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,

  // Required for Render managed Postgres (SSL/TLS)
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(() => console.log("Connected to Postgres ✅"))
  .catch((e) => console.log(`Error connecting to Postgres server:\n${e}`));

module.exports = client;