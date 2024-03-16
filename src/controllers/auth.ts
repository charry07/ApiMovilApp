const bcryptjs = require('bcryptjs');
import { restart } from 'nodemon';
import { db, dbAzure } from '../../DB Conection/index';
import { generateJWT } from '../controllers/jwt';
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const SecretKey = process.env.SECRET_JWT_SEED || 'secret';

export const registerController = async (request: any, reply: any) => {
  const { password, email, username } = request.body;
  console.log('registerController by', email);

  // Encriptar contraseña
  const salt = bcryptjs.genSaltSync();
  const hashedPassword = bcryptjs.hashSync(password, salt);

  // Verificar si el usuario ya existe
  const findUser = await dbAzure(`SELECT * FROM users WHERE email = '${email}'`);
  if (findUser.length > 0) return reply.status(201).send({ message: 'El usuario ya existe' });

  try {
    // Guardar el nuevo usuario en la base de datos
    await dbAzure(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`);
    const User = await dbAzure(`SELECT * FROM users WHERE email = '${email}'`);

    const token = await generateJWT(User.id, username);

    password && email && username
      ? reply.status(200).send({ message: 'Se registro exitosamente!', user: { id: User.id, username, email }, token })
      : reply.status(400).send({ message: 'Error verifica el email y la contrasena' });
  } catch (error: any) {
    reply.status(500).send({ Error: error.message });
  }
};

// Controlador para el inicio de sesión de los usuarios
export const loginController = async (request: any, reply: any) => {
  const { password, email } = request.body;
  // Verifica si el usuario ya existe
  const findUser = await dbAzure(`SELECT * FROM users WHERE email = '${email}'`);
  console.log(request.body);
  if (!findUser) return reply.status(400).send({ message: 'Usuario no encontrado' });
  // Verifica la contraseña
  const validPassword = bcryptjs.compareSync(password, findUser.password);
  // Genera un token JWT
  const token = await generateJWT(findUser.id, findUser.username);
  // Envía la respuesta
  validPassword ? reply.send({ message: 'Login Successfully', user: findUser, token }) : reply.status(400).send({ message: 'Error verifica el email y la contrasena' });
};

// olvide mi contraseña
export const forgotPasswordController = async (request: any, reply: any) => {
  const { email } = request.body;
  // Verificar si el correo electrónico existe en la base de datos
  const user = await dbAzure(`SELECT * FROM users WHERE email = '${email}'`);
  if (!user) {
    return reply.status(400).send({ message: 'No existe una cuenta con ese correo electrónico.' });
  }
  // Guarda el token de restablecimiento de contraseña y la fecha de expiración en la base de datos
  const token = jwt.sign({ id: user.id }, SecretKey, { expiresIn: '1h' });
  // await dbAzure(`UPDATE users SET resetCode = '${token}', resetCodeExpires = '${Date.now() + 3600000}' WHERE email = '${email}'`);

  // Enviar un correo electrónico al usuario con el enlace para restablecer la contraseña
  const resetUrl = `http://localhost:3001/api/auth/reset/token=${token}`;
  const message = `Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace, o pégalo en tu navegador para completar el proceso: ${resetUrl}`;

  // Configurar el transporte de correo electrónico
  // const transporter = nodemailer.createTransport({
  //   host: 'smtp.ethereal.email',
  //   port: 587,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // Configurar las opciones del correo electrónico
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Restablecimiento de contraseña',
    text: message,
  };

  try {
    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions).then((info: any) => {
      console.log(info);
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Hubo un problema al enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.' });
  }

  reply.send({ message: 'Se ha enviado un correo electrónico con las instrucciones para restablecer la contraseña.' });
};

export const resetController = async (request: any, reply: any) => {
  const { token } = request.params;
  try {
    // Verificar si el token de restablecimiento de contraseña es válido
    const isValid = jwt.verify(token, SecretKey);
    if (!isValid) return reply.status(400).send({ message: 'El token no es válido o ha expirado.' });

  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: 'Hubo un problema al restablecer la contraseña. Por favor, inténtalo de nuevo más tarde.' });
  }
};

// Controlador para validar el token JWT
export const ValidarToken = async (request: any, reply: any) => {
  const bearerToken = request.headers['authorization'];
  const token = bearerToken && bearerToken.split(' ')[1]; // parte en 2 el token osea el bearer y el token y toma el token
  if (!token) return reply.status(401).send({ message: 'No hay token en la peticion' });
  try {
    const { id, username }: any = await jwt.verify(token, SecretKey);
    const newToken = await generateJWT(id, username);
    const message = { message: 'Token renovado', id, username, token: newToken };
    reply.status(200).send(message);
  } catch (error) {
    reply.status(401).send({ message: 'Token no valido' });
  }
};

export const middlewareToken = async (request: any, reply: any) => {
  const bearerToken = request.headers['authorization'];
  const token = bearerToken && bearerToken.split(' ')[1]; // parte en 2 el token osea el bearer y el token y toma el token
  if (!token) throw new Error('No hay token en la peticion');
  try {
    const { id, username }: any = await jwt.verify(token, SecretKey);
    const newToken = await generateJWT(id, username);
    request.user = { id, username, token: newToken };
  } catch (error) {
    throw new Error('Token no valido');
  }
};
