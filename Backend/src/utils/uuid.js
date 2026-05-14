const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value) => typeof value === 'string' && uuidRegex.test(value);

const nullableUuid = (value) => (isUuid(value) ? value : null);

module.exports = { isUuid, nullableUuid };
