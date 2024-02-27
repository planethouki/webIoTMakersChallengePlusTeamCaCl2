const uuid = require('uuid');
const bbt = require('beebotte');

exports.handler = function(event, context, callback) {
  if (event.httpMethod === 'PUT') {
    return put(event, context, callback);
  } else if (event.httpMethod === 'GET') {
    return get(event, context, callback);
  }

  return callback(null, {
    statusCode: 405
  });
}

async function get(event, context, callback) {
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  bclient.read(
    {channel: 'cacl2', resource: 'measure_result', limit: 5},
    function(err, res) {
      if (err) {
        return callback(err)
      }
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(res)
      });
    });
}

async function put(event, context, callback) {
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  bclient.publish(
    {channel: 'cacl2', resource: 'measure_trigger', data: 'trigger'},
    function(err, res) {
      if (err) {
        return callback(err)
      }
      callback(null, {
        statusCode: 200
      });
    });
}
