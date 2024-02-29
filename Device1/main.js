import sleep from './sleep.js'
import { getDistanceSensor, init as initDistanceSensor } from "./distance-sensor.js";
import { loopBlink, fastBlinkOnce, init as initLedIndicator } from "./led-indicator.js";
import { loop24hour, loopHour } from "./loop-auto.js";
import { getLogger } from "./logger.js";
import mqtt from 'mqtt'
import dotenv from 'dotenv'

dotenv.config()

await initDistanceSensor()
await initLedIndicator()

loopBlink()

const logger = getLogger()

// https://beebotte.com/docs/mqtt
const client =  mqtt.connect('mqtt://mqtt.beebotte.com',
  {username: `${process.env.BEEBOTTE_TOKEN}`, password: ''}
);

client.on('message', async function (topic, message) {
  logger.info(topic + '   ' + message); // cacl2/measure   {"data":"trigger","ispublic":true,"ts":1709025518527}
  if (topic === 'cacl2/measure_trigger') {
    const messageObj = JSON.parse(message);
    if (messageObj.data !== 'trigger') {
      return
    }
    fastBlinkOnce()
    const { average } = await getDistanceSensor().getAverage()
    client.publish('cacl2/measure_result', JSON.stringify({
      data: average,
      write: true
    }));
  }
});

client.subscribe('cacl2/measure_trigger');



// loop24hour(client)
loopHour(client)
