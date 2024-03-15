import { registerController, loginController, ValidarToken, forgotPasswordController, resetController } from '../controllers/auth';

const AuthRoutes = [
  {
    url: '/api/auth/register',
    method: 'POST',
    handler: registerController,
  },
  {
    url: '/api/auth/login',
    method: 'POST',
    handler: loginController,
  },
  {
    url: '/api/auth/forgotPassword',
    method: 'POST',
    handler: forgotPasswordController,
  },
  {
    url: '/api/auth/validateToken',
    method: 'GET',
    handler: ValidarToken,
  },
  {
    url: '/api/auth/reset/:code',
    method: 'GET',
    handler: resetController,
  },
];

module.exports = AuthRoutes;
