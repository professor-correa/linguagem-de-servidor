import { raffleRoutes } from './raffle-routes.js';
import { sendError } from '../utils/http.js';
import { handleError } from '../utils/handle-error.js';

const routes = [...raffleRoutes];

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

      return await route.handler({ request, response, params, query: url.searchParams });
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
