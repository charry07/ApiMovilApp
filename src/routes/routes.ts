import { db } from '../../DB Conection';
import { dbAzure } from '../../DB Conection';
import { middlewareToken } from '../controllers/auth';
const bcryptjs = require('bcryptjs');

const Routes = [
  {
    url: '/',
    method: 'GET',
    handler: (request: any, reply: any) => {
      reply.send({ message: 'Bienvenido a la API de mi app movil Anderson Charry Naranjo' });
    },
  },
  {
    url: '/api/users',
    method: 'GET',
    preHandler: (request: any, reply: any) => middlewareToken(request, reply), // funciona como un middleware
    handler: async (request: any, reply: any) => {
      try {
        const users = await dbAzure('SELECT * FROM users');
        reply.send(users);
      } catch (error: any) {
        reply.status(500).send({ message: error.message });
      }
    },
  },
  {
    url: '/api/users/:id',
    method: 'GET',
    preHandler: (request: any, reply: any) => middlewareToken(request, reply), // funciona como un middleware
    handler: async (request: any, reply: any) => {
      try {
        const id = request.params.id;
        const user = await dbAzure(`SELECT * FROM users WHERE id = ${id}`);
        reply.send(user);
      } catch (error: any) {
        reply.status(500).send({ message: error.message });
      }
    },
  },
  {
    url: '/api/users/:id',
    method: 'PUT',
    preHandler: (request: any, reply: any) => middlewareToken(request, reply), // funciona como un middleware
    handler: async (request: any, reply: any) => {
      try {
        const id = request.params.id;
        const { username, email, firstName, lastName, birthDate, phoneNumber , password } = request.body;
        console.log(request.body)
        if(password) {
          console.log('entrando a cambiar contraseña')
          const salt = bcryptjs.genSaltSync();
          const hashedPassword = bcryptjs.hashSync(password, salt);
          await dbAzure(`UPDATE users SET password = '${hashedPassword}' WHERE id = ${id}`);
          const user = await dbAzure(`SELECT * FROM users WHERE id = ${id}`);
          reply.send(user);
        }
        await dbAzure(`UPDATE users SET username = '${username}', email = '${email}', firstName = '${firstName}', lastName = '${lastName}', birthDate = '${birthDate}', phoneNumber = '${phoneNumber}' WHERE id = ${id}`);
        const user = await dbAzure(`SELECT * FROM users WHERE id = ${id}`);
        reply.send(user);
      } catch (error: any) {
        reply.status(500).send({ message: error });
      }
    },
  },
  {
    url: '/api/test-db',
    method: 'GET',
    handler: async (request: any, reply: any) => {
      try {
        const result = await dbAzure('SELECT * from users');
        reply.send(result);
      } catch (error: any) {
        reply.status(500).send({ message: 'Error de conexión a la base de datos: ' + error.message });
      }
    },
  },
];

module.exports = Routes;
