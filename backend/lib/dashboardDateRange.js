const SUPPORTED_RANGES = new Set(['today', '7d', '30d', 'month', 'all', 'custom']);
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

const readDateValue = (value, name) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw badRequest(`Invalid ${name} date`);
  const trimmed = value.trim();
  return trimmed || null;
};

const parseBoundary = (value, boundary) => {
  const dateOnlyMatch = DATE_ONLY.exec(value);
  let date;

  if (dateOnlyMatch) {
    const [, yearText, monthText, dayText] = dateOnlyMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
      throw badRequest('Invalid dashboard date range');
    }

    date = new Date(year, month - 1, day, 0, 0, 0, 0);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      throw badRequest('Invalid dashboard date range');
    }
    if (boundary === 'end') date.setHours(23, 59, 59, 999);
    return date;
  }

  date = new Date(value);
  if (Number.isNaN(date.getTime())) throw badRequest('Invalid dashboard date range');
  return date;
};

const dayStart = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const dayEnd = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Parse the shared admin reporting range in the server's local calendar.
 * Date-only custom bounds cover the full selected day; invalid or reversed
 * ranges are rejected before any dashboard query runs.
 */
export const parseDateRange = (query = {}, nowValue = new Date()) => {
  const rawRange = query?.range ?? '30d';
  if (typeof rawRange !== 'string' || !SUPPORTED_RANGES.has(rawRange.trim())) {
    throw badRequest('Unsupported dashboard date range');
  }

  const range = rawRange.trim();
  if (range === 'all') return { start: null, end: null };

  const from = readDateValue(query?.from, 'start');
  const to = readDateValue(query?.to, 'end');
  if (range === 'custom' && (!from || !to)) {
    throw badRequest('Custom range requires both from and to dates');
  }

  const now = new Date(nowValue);
  if (Number.isNaN(now.getTime())) throw badRequest('Unable to calculate dashboard date range');
  let start = dayStart(now);
  let end = dayEnd(now);

  if (!from && !to) {
    if (range === '7d') {
      start.setDate(start.getDate() - 6);
    } else if (range === '30d') {
      start.setDate(start.getDate() - 29);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }
  }

  if (from) start = parseBoundary(from, 'start');
  if (to) end = parseBoundary(to, 'end');
  if (start.getTime() > end.getTime()) throw badRequest('Start date must be on or before end date');

  return { start, end };
};
