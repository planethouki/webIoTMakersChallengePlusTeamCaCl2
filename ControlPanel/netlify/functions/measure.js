const uuid = require('uuid');
const bbt = require('beebotte');

exports.handler = function(event, context, callback) {
  if (event.httpMethod !== 'PUT') {
    return callback(null, {
      statusCode: 405
    });
  }
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
