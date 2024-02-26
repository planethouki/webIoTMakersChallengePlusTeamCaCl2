const bbt = require('beebotte');

exports.handler = function(event, context, callback) {
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  bclient.publish(
    {channel: 'cacl2', resource: 'measure'},
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
