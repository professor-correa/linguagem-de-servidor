import { authRoutes } from './auth-routes.js';
import { raffleRoutes } from './raffle-routes.js';
import { ticketRoutes } from './ticket-routes.js';
import * as sessionModel from '../models/session-model.js';
import { sendError } from '../utils/http.js';
import { handleError } from '../utils/handle-error.js';
import { hashToken, readBearerToken } from '../utils/token.js';

const routes = [...authRoutes, ...raffleRoutes, ...ticketRoutes];

function matchPath(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < patternParts.length; index++) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

async function findCurrentUser(request) {
  const token = readBearerToken(request);
  return token ? sessionModel.findUserByTokenHash(hashToken(token)) : null;
}

export async function router(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const allowedMethods = [];

  try {
    for (const route of routes) {
      const params = matchPath(route.path, url.pathname);

      if (!params) {
        continue;
      }

      if (route.method !== request.method) {
        allowedMethods.push(route.method);
        continue;
      }

      const user = route.access ? await findCurrentUser(request) : null;

      if (route.access && !user) {
        return sendError(response, 401, 'Authentication required');
      }

      if (route.access === 'admin' && user.role !== 'admin') {
        return sendError(response, 403, 'Only admins can do this');
      }

      return await route.handler({ request, response, params, query: url.searchParams, user });
    }

    if (allowedMethods.length > 0) {
      response.setHeader('Allow', allowedMethods.join(', '));
      return sendError(response, 405, 'Method not allowed');
    }

    return sendError(response, 404, 'Route not found');
  } catch (error) {
    return handleError(response, error);
  }
}
