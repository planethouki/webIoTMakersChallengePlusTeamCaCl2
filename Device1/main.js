import sleep from './sleep.js'
import { getDistanceSensor } from "./distance-sensor.js";
import { loopBlink, fastBlinkOnce } from "./led-indicator.js";
import { loop24hour } from "./loop-auto.js";
import mqtt from 'mqtt'
import dotenv from 'dotenv'

dotenv.config()

const distanceSensor = await getDistanceSensor()

// https://beebotte.com/docs/mqtt
const client =  mqtt.connect('mqtt://mqtt.beebotte.com',
  {username: `${process.env.BEEBOTTE_TOKEN}`, password: ''}
);

client.on('message', async function (topic, message) {
  console.log(topic + '   ' + message); // cacl2/measure   {"data":"trigger","ispublic":true,"ts":1709025518527}
  if (topic === 'cacl2/measure_trigger') {
    const messageObj = JSON.parse(message);
    if (messageObj.data !== 'trigger') {
      return
    }
    fastBlinkOnce()
    const distanceResult = await distanceSensor.getAverage()
    console.log(distanceResult)
    const response = {
      data: distanceResult.average,
      write: true
    }
    client.publish('cacl2/measure_result', JSON.stringify(response));
  }
});

client.subscribe('cacl2/measure_trigger');

// setInterval(function() {
//   client.publish('cacl2/res1', 'Hello World');
// }, 1000 /* 1 second */);

loopBlink()

loop24hour()
