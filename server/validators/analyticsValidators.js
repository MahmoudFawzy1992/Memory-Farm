const { query } = require('express-validator');

const iso = (name, { required = false } = {}) => {
  const chain = query(name);
  return required
    ? chain.isISO8601().withMessage(`${name} must be ISO date (YYYY-MM-DD)`)
    : chain.optional().isISO8601().withMessage(`${name} must be ISO date (YYYY-MM-DD)`);
};

exports.validateCalendarSummary = [
  iso('from', { required: true }),
  iso('to'),
];

exports.validateByDate = [
  iso('date', { required: true }),
];

exports.validateMoodDistribution = [
  iso('from', { required: true }),
  iso('to'),
];

exports.validateMoodTrend = [
  iso('from', { required: true }),
  iso('to'),
  query('interval').optional().isIn(['day', 'month']).withMessage('interval must be day or month'),
];
