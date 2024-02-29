const bbt = require("beebotte");

exports.handler =  async function(event, context) {
  if (event.httpMethod === 'PUT') {
    const res = await analyze()
    return {
      statusCode: 200,
      body: JSON.stringify(res)
    }
  }

  return {
    statusCode: 405
  }
}

async function analyze() {
  const limit = 10
  const bclient = new bbt.Connector({token: process.env.BEEBOTTE_TOKEN});
  const result = await new Promise((resolve, reject) => {
    bclient.read(
      {channel: 'cacl2', resource: 'measure_result', limit},
      function(err, res) {
        if (err) {
          return reject(err)
        }
        resolve(res)
      });
  })
  const resultOfTwo = result
    .filter((r) => r.data < 2000)
    .filter((r, i) => i < 2)
    .map((r) => ({ data: r.data, ts: r.ts }))

  if (resultOfTwo.length !== 2) {
    throw new Error('Failed to get enough data')
  }

  const [after, before] = resultOfTwo

  if (after.data - before.data > -10) {
    console.log('No need to spread', before, after)
    return {
      isTriggerSpread: false,
    }
  }

  console.log('Start spreading', before, after)

  await new Promise((resolve, reject) => {
    bclient.publish(
      {channel: 'cacl2', resource: 'spread_trigger', data: 'trigger'},
      function(err, res) {
        if (err) {
          return reject(err)
        }
        resolve(res)
      }
    )
  })

  return {
    isTriggerSpread: true
  }

}

exports.analyze = analyze
