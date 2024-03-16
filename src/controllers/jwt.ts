const jwt = require('jsonwebtoken');
require('dotenv').config();

export const generateJWT = (id: any, username: any) => {
  return new Promise((resolve, reject) => {
    const payload = { id, username };
    jwt.sign(payload, process.env.SECRET_JWT_SEED, { expiresIn: '2h' }, (err: any, token: any) => {
      err ? reject('No se pudo generar el token: '+err) : resolve(token);
    });
  });
};
