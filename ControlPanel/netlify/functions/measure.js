const uuid = require('uuid');
const bbt = require('beebotte');

exports.handler = function(event, context, callback) {
  if (event.httpMethod === 'PUT') {
    return put(event, context)
      .then((res) => callback(null, res))
      .catch((err) => callback(err));
  } else if (event.httpMethod === 'GET') {
    return get(event, context)
      .then((res) => callback(null, res))
      .catch((err) => callback(err));
  }

  return callback(null, {
    statusCode: 405
  });
}

async function get(event, context) {
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  return new Promise((resolve, reject) => {
    bclient.read(
      {channel: 'cacl2', resource: 'measure_result', limit: 5},
      function(err, res) {
        if (err) {
          return reject(err)
        }
        resolve({
          statusCode: 200,
          body: JSON.stringify({result: res})
        })
      });
  })
}

async function put(event, context) {
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  return new Promise((resolve, reject) => {
    bclient.publish(
      {channel: 'cacl2', resource: 'measure_trigger', data: 'trigger'},
      function(err, res) {
        if (err) {
          return reject(err)
        }
        resolve({
          statusCode: 200
        })
      });
  })
}
