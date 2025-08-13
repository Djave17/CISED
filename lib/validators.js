function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function hasRequiredFields(obj, fields) {
  return fields.every(field => obj[field] !== undefined && obj[field] !== null);
}

module.exports = { isNonEmptyString, hasRequiredFields };
