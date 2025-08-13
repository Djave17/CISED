// src/config/env.js
const { cleanEnv, num, makeValidator } = require('envalid');
require('dotenv').config(); // carga .env si existe

// Validador de MongoURI
const mongoUri = makeValidator((v) => {
  if (!/^mongodb(?:\+srv)?:\/\//.test(v)) throw new Error('Invalid Mongo URI');
  return v;
});

const env = cleanEnv(process.env, {
  PORT:             num({ default: 3000 }),
  MONGO_URI:        mongoUri(),
});

module.exports = env;
