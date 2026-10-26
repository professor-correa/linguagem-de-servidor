import { cleanText, isPlainObject, isValidDate } from './helpers.js';

const EDITABLE_STATUSES = ['open', 'closed'];

export function validateRaffle(data) {
  if (!isPlainObject(data)) {
    return { error: 'Body must be a JSON object' };
  }

  const title = cleanText(data.title);
  const description = cleanText(data.description);
  const prize = cleanText(data.prize);
  const imageUrl = cleanText(data.imageUrl);
  const status = data.status ?? 'open';

  if (title.length < 3 || title.length > 120) {
    return { error: 'Field title must have between 3 and 120 characters' };
  }

  if (description.length < 10 || description.length > 2000) {
    return { error: 'Field description must have between 10 and 2000 characters' };
  }

  if (prize.length < 2 || prize.length > 150) {
    return { error: 'Field prize must have between 2 and 150 characters' };
  }

  if (typeof data.ticketPrice !== 'number' || !Number.isFinite(data.ticketPrice) || data.ticketPrice <= 0) {
    return { error: 'Field ticketPrice must be a positive number' };
  }

  if (!Number.isInteger(data.totalTickets) || data.totalTickets < 10 || data.totalTickets > 10000) {
    return { error: 'Field totalTickets must be an integer between 10 and 10000' };
  }

  if (!isValidDate(data.drawDate)) {
    return { error: 'Field drawDate must be a valid date in the format YYYY-MM-DD' };
  }

  if (imageUrl && (!imageUrl.startsWith('https://') || imageUrl.length > 500)) {
    return { error: 'Field imageUrl must be an https address with up to 500 characters' };
  }

  if (!EDITABLE_STATUSES.includes(status)) {
    return { error: 'Field status must be open or closed' };
  }

  return {
    value: {
      title,
      description,
      prize,
      ticketPrice: Math.round(data.ticketPrice * 100) / 100,
      totalTickets: data.totalTickets,
      drawDate: data.drawDate,
      imageUrl: imageUrl || null,
      status,
    },
  };
}
