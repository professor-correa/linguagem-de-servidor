import * as authController from '../controllers/auth-controller.js';

export const authRoutes = [
  { method: 'POST', path: '/api/auth/register', handler: authController.register },
  { method: 'POST', path: '/api/auth/login', handler: authController.login },
  { method: 'POST', path: '/api/auth/logout', handler: authController.logout, access: 'authenticated' },
  { method: 'GET', path: '/api/auth/me', handler: authController.me, access: 'authenticated' },
];
