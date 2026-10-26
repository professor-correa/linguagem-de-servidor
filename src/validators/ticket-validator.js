import { isPlainObject } from './helpers.js';

export function validateTicketNumber(data, totalTickets) {
  if (!isPlainObject(data)) {
    return { error: 'Body must be a JSON object' };
  }

  if (!Number.isInteger(data.number) || data.number < 1 || data.number > totalTickets) {
    return { error: `Field number must be an integer between 1 and ${totalTickets}` };
  }

  return { value: { number: data.number } };
}
