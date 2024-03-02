import mqtt from 'mqtt'
import dotenv from 'dotenv'
import sleep from './sleep.js'
import { getLogger } from "./logger.js";
import { writeBlockchain } from "./blockchain.js";
import { getDistanceSensor, init as initDistanceSensor } from "./distance-sensor.js";
import { servoMotorInit, getServoMotor } from "./servo-motor.js";
import { dcMotorInit, getDcMotor } from "./dc-motor.js";

dotenv.config();

const logger = getLogger()

await Promise.all([
  servoMotorInit(),
  dcMotorInit(),
  initDistanceSensor(),
]);

const servoMotor = getServoMotor();
const dcMotor = getDcMotor();
const distanceSensor = getDistanceSensor();

async function spread() {
  await dcMotor.free();
  await sleep(500);
  await dcMotor.fwd();
  await sleep(1000);
  await servoMotor.setServo(0, -30);
  await sleep(100);
  await servoMotor.setServo(0, 30);
  await sleep(1000);
  await dcMotor.brake();
}

const mqttClient =  mqtt.connect('mqtt://mqtt.beebotte.com',
  {username: `${process.env.BEEBOTTE_TOKEN}`, password: ''}
);

mqttClient.on('message', async function (topic, message) {
  logger.info(topic + '   ' + message);
  if (topic === 'cacl2/spread_trigger') {
    const messageObj = JSON.parse(message);
    if (messageObj.data !== 'trigger') {
      return
    }
    await spread()
    mqttClient.publish('cacl2/spread_result', JSON.stringify({
      data: 'result',
      write: true
    }));
    writeBlockchain('spread', Date.now().toString());
    const { distance } = await distanceSensor.getOnce()
    mqttClient.publish('cacl2/remaining_result', JSON.stringify({
      data: distance,
      write: true
    }));
  }
});

mqttClient.subscribe('cacl2/spread_trigger');

logger.info('waiting for trigger...');
