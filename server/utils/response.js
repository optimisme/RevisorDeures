function sendResponse(res, statusCode, body) {
  return res.status(statusCode).json(body);
}

module.exports = { sendResponse };
