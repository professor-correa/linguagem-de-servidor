import * as userModel from '../models/user-model.js';
import * as sessionModel from '../models/session-model.js';
import { validateLogin, validateRegistration } from '../validators/auth-validator.js';
import { readJsonBody, sendError, sendJson, sendNoContent } from '../utils/http.js';
import { checkPassword, hashPassword } from '../utils/password.js';
import { createToken, hashToken, readBearerToken } from '../utils/token.js';

const SESSION_DAYS = Number(process.env.SESSION_DAYS) || 7;

export async function register({ request, response }) {
  const data = await readJsonBody(request);

  if (data === null) {
    return sendError(response, 400, 'Invalid JSON body');
  }

  const { error, value } = validateRegistration(data);

  if (error) {
    return sendError(response, 400, error);
  }

  const passwordHash = await hashPassword(value.password);

  try {
    const user = await userModel.create({ ...value, passwordHash });
    return sendJson(response, 201, user);
  } catch (creationError) {
    if (creationError.code === 'ER_DUP_ENTRY') {
      return sendError(response, 409, 'Email is already registered');
    }

    throw creationError;
  }
}

export async function login({ request, response }) {
  const data = await readJsonBody(request);

  if (data === null) {
    return sendError(response, 400, 'Invalid JSON body');
  }

  const { error, value } = validateLogin(data);

  if (error) {
    return sendError(response, 400, error);
  }

  const credentials = await userModel.findCredentialsByEmail(value.email);
  const passwordMatches = credentials && (await checkPassword(value.password, credentials.passwordHash));

  // A mesma mensagem para email inexistente e senha errada, para a API
  // não revelar quais emails estão cadastrados.
  if (!passwordMatches) {
    return sendError(response, 401, 'Invalid email or password');
  }

  const token = createToken();
  await sessionModel.create(credentials.id, hashToken(token), SESSION_DAYS);

  const user = await userModel.findById(credentials.id);
  return sendJson(response, 200, { token, user });
}

export async function logout({ request, response }) {
  await sessionModel.remove(hashToken(readBearerToken(request)));
  return sendNoContent(response);
}

export function me({ response, user }) {
  return sendJson(response, 200, user);
}
