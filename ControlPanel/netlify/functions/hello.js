const uuid = require('uuid');

exports.handler = function(event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ id: uuid.v4() })
  });
}
