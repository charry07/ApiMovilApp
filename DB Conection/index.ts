import { query } from 'mssql';
import { as } from 'pg-promise';

const pgp = require('pg-promise')();

export const db = pgp({
  // conexion con base de datos local de docker compose up
  host: 'localhost',
  port: 5432,
  database: 'AquiVaElNombreDeTuBaseDeDatos',
  user: 'Charry07',
  password: 'Charry07',
});

const sql = require('mssql');

const config = {
  // conexion con base de datos de azure for students free
  user: 'CloudSA411e78a9',
  password: 'Charryto-07',
  server: 'acharry-server.database.windows.net',
  database: 'acharry-db',
  options: {
    encrypt: true,
  },
};

const poolPromise = sql
  .connect(config)
  .then((pool: any) => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch((err: Error) => console.log('Database Connection Failed! Bad Config: ', err));

export const dbAzure = async (query: string): Promise<any> => {
  const result = await (await poolPromise).request().query(query);
  if (result?.recordset?.length === 1) return result.recordset[0];
  return result.recordset;
};
