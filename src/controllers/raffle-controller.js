import { randomInt } from 'node:crypto';
import * as raffleModel from '../models/raffle-model.js';
import * as ticketModel from '../models/ticket-model.js';
import { validateRaffle } from '../validators/raffle-validator.js';
import { readJsonBody, sendError, sendJson, sendNoContent } from '../utils/http.js';
import { parseId } from '../utils/parse-id.js';

const STATUSES = ['open', 'closed', 'drawn'];

export async function list({ response, query }) {
  const status = query.get('status');

  if (status !== null && !STATUSES.includes(status)) {
    return sendError(response, 400, 'Query status must be open, closed or drawn');
  }

  const raffles = await raffleModel.findAll({
    status,
    search: query.get('search')?.trim(),
  });

  return sendJson(response, 200, raffles);
}

export async function show({ response, params }) {
  const id = parseId(params.id);

  if (!id) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  const raffle = await raffleModel.findById(id);

  if (!raffle) {
    return sendError(response, 404, 'Raffle not found');
  }

  const takenNumbers = await ticketModel.findTakenNumbers(id);
  const winner = raffle.winnerTicketId ? await ticketModel.findWinner(raffle.winnerTicketId) : null;

  return sendJson(response, 200, { ...raffle, takenNumbers, winner });
}

export async function create({ request, response }) {
  const data = await readJsonBody(request);

  if (data === null) {
    return sendError(response, 400, 'Invalid JSON body');
  }

  const { error, value } = validateRaffle(data);

  if (error) {
    return sendError(response, 400, error);
  }

  const raffle = await raffleModel.create(value);

  response.setHeader('Location', `/api/raffles/${raffle.id}`);
  return sendJson(response, 201, raffle);
}

export async function update({ request, response, params }) {
  const id = parseId(params.id);

  if (!id) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  const data = await readJsonBody(request);

  if (data === null) {
    return sendError(response, 400, 'Invalid JSON body');
  }

  const { error, value } = validateRaffle(data);

  if (error) {
    return sendError(response, 400, error);
  }

  const current = await raffleModel.findById(id);

  if (!current) {
    return sendError(response, 404, 'Raffle not found');
  }

  if (current.status === 'drawn') {
    return sendError(response, 409, 'A drawn raffle cannot be changed');
  }

  const highestNumber = await ticketModel.findHighestNumber(id);

  if (value.totalTickets < highestNumber) {
    return sendError(response, 409, `Total tickets cannot be lower than ${highestNumber}, a number already taken`);
  }

  await raffleModel.update(id, value);

  const raffle = await raffleModel.findById(id);
  return sendJson(response, 200, raffle);
}

export async function remove({ response, params }) {
  const id = parseId(params.id);

  if (!id) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  try {
    const deleted = await raffleModel.remove(id);

    if (!deleted) {
      return sendError(response, 404, 'Raffle not found');
    }

    return sendNoContent(response);
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return sendError(response, 409, 'Raffle has tickets and cannot be deleted');
    }

    throw error;
  }
}

export async function draw({ response, params }) {
  const id = parseId(params.id);

  if (!id) {
    return sendError(response, 400, 'Id must be a positive integer');
  }

  const raffle = await raffleModel.findById(id);

  if (!raffle) {
    return sendError(response, 404, 'Raffle not found');
  }

  if (raffle.status === 'drawn') {
    return sendError(response, 409, 'Raffle has already been drawn');
  }

  const paidTicketIds = await ticketModel.findPaidIds(id);

  if (paidTicketIds.length === 0) {
    return sendError(response, 409, 'There are no paid tickets to draw');
  }

  const winnerTicketId = paidTicketIds[randomInt(paidTicketIds.length)];
  const drawn = await raffleModel.markAsDrawn(id, winnerTicketId);

  if (!drawn) {
    return sendError(response, 409, 'Raffle has already been drawn');
  }

  const winner = await ticketModel.findWinner(winnerTicketId);
  return sendJson(response, 200, { raffleId: id, winner });
}
