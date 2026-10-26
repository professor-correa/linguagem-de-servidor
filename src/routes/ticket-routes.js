import * as ticketController from '../controllers/ticket-controller.js';

export const ticketRoutes = [
  { method: 'GET', path: '/api/raffles/:id/tickets', handler: ticketController.listByRaffle, access: 'admin' },
  { method: 'POST', path: '/api/raffles/:id/tickets', handler: ticketController.reserve, access: 'authenticated' },
  { method: 'GET', path: '/api/me/tickets', handler: ticketController.listMine, access: 'authenticated' },
  { method: 'PATCH', path: '/api/tickets/:id/pay', handler: ticketController.pay, access: 'admin' },
];
