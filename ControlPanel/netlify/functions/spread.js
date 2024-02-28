const bbt = require('beebotte');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'PUT') {
    return await put(event, context);
  } else if (event.httpMethod === 'GET') {
    return await get(event, context);
  }

  return {
    statusCode: 405
  }
}

async function get(event, context) {
  const limit = event.queryStringParameters.limit || 10
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  return new Promise((resolve) => {
    bclient.read(
      {channel: 'cacl2', resource: 'spread_result', limit},
      function(err, res) {
        if (err) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({error: err})
          })
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
  return new Promise((resolve) => {
    bclient.publish(
      {channel: 'cacl2', resource: 'spread_trigger', data: 'trigger'},
      function(err, res) {
        if (err) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({error: err})
          })
        }
        resolve({
          statusCode: 200
        })
      });
  })
}
