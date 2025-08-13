function info(message, ...meta) {
  console.log(`[INFO] ${message}`, ...meta);
}

function error(message, ...meta) {
  console.error(`[ERROR] ${message}`, ...meta);
}

module.exports = { info, error };
