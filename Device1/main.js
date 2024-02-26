import sleep from './sleep.js'
import { getOnce } from "./distance-sensor.js";
import { loopBlink, fastBlinkOnce } from "./led-indicator.js";
import mqtt from 'mqtt'
import dotenv from 'dotenv'

dotenv.config()

// https://beebotte.com/docs/mqtt
const client =  mqtt.connect('mqtt://mqtt.beebotte.com',
  {username: `${process.env.BEEBOTTE_TOKEN}`, password: ''}
);

client.on('message', async function (topic, message) {
  console.log(topic + '   ' + message);
  await Promise.all([
    fastBlinkOnce(),
    getOnce()
  ])
});

client.subscribe('cacl2/measure');

// setInterval(function() {
//   client.publish('cacl2/res1', 'Hello World');
// }, 1000 /* 1 second */);

loopBlink()

while (true) {
  try {
    const startTime = Date.now()
    const result = await getOnce()
    // todo 散布するかどうかを判定
    // todo 散布する処理を呼ぶ
    const elapsedTime = Date.now() - startTime
    await sleep(24 * 60 * 60 * 1000 - elapsedTime)
  } catch (error) {
    console.error(error)
    await sleep(10 * 1000)
  }
}
