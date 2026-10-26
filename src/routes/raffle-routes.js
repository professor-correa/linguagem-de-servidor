import * as raffleController from '../controllers/raffle-controller.js';

export const raffleRoutes = [
  { method: 'GET', path: '/api/raffles', handler: raffleController.list },
  { method: 'GET', path: '/api/raffles/:id', handler: raffleController.show },
  { method: 'POST', path: '/api/raffles', handler: raffleController.create },
  { method: 'PUT', path: '/api/raffles/:id', handler: raffleController.update },
  { method: 'DELETE', path: '/api/raffles/:id', handler: raffleController.remove },
];
