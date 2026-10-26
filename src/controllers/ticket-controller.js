import * as raffleModel from '../models/raffle-model.js';
import * as ticketModel from '../models/ticket-model.js';
import { validateTicketNumber } from '../validators/ticket-validator.js';
import { readJsonBody, sendError, sendJson } from '../utils/http.js';
import { parseId } from '../utils/parse-id.js';

export async function listByRaffle({ response, params }) {
  const raffleId = parseId(params.id);

  if (!raffleId) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  const raffle = await raffleModel.findById(raffleId);

  if (!raffle) {
    return sendError(response, 404, 'Raffle not found');
  }

  const tickets = await ticketModel.findByRaffle(raffleId);
  return sendJson(response, 200, tickets);
}

export async function listMine({ response, user }) {
  const tickets = await ticketModel.findByUser(user.id);
  return sendJson(response, 200, tickets);
}

export async function reserve({ request, response, params, user }) {
  const raffleId = parseId(params.id);

  if (!raffleId) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  const data = await readJsonBody(request);

  if (data === null) {
    return sendError(response, 400, 'Invalid JSON body');
  }

  const raffle = await raffleModel.findById(raffleId);

  if (!raffle) {
    return sendError(response, 404, 'Raffle not found');
  }

  if (raffle.status !== 'open') {
    return sendError(response, 409, 'Raffle is not open for new tickets');
  }

  const { error, value } = validateTicketNumber(data, raffle.totalTickets);

  if (error) {
    return sendError(response, 400, error);
  }

  try {
    const ticket = await ticketModel.create({ raffleId, userId: user.id, number: value.number });
    return sendJson(response, 201, ticket);
  } catch (creationError) {
    if (creationError.code === 'ER_DUP_ENTRY') {
      return sendError(response, 409, `Number ${value.number} is already taken`);
    }

    throw creationError;
  }
}

export async function pay({ response, params }) {
  const id = parseId(params.id);

  if (!id) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  const updated = await ticketModel.markAsPaid(id);

  if (!updated) {
    return sendError(response, 404, 'Ticket not found');
  }

  const ticket = await ticketModel.findById(id);
  return sendJson(response, 200, ticket);
}
