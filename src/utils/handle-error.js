import { sendError } from './http.js';

const DATABASE_ERRORS = {
  ER_NO_REFERENCED_ROW_2: { status: 400, message: 'Related record not found' },
  ER_ROW_IS_REFERENCED_2: { status: 409, message: 'Record is in use and cannot be deleted' },
  ER_DUP_ENTRY: { status: 409, message: 'Duplicate value' },
};

export function handleError(response, error) {
  if (response.headersSent) {
    response.end();
    return;
  }

  const knownError = DATABASE_ERRORS[error.code];

  if (knownError) {
    sendError(response, knownError.status, knownError.message);
    return;
  }

  console.error(error);
  sendError(response, 500, 'Internal server error');
}
