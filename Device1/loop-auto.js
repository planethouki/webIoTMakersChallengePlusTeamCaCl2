import sleep from './sleep.js'
import { getDistanceSensor } from "./distance-sensor.js";
import { fastBlinkOnce } from "./led-indicator.js";
import { getLogger } from "./logger.js";

const logger = getLogger()

async function loop(mqttClient, milliseconds) {
  while (true) {
    try {
      const startTime = Date.now()
      logger.info('Periodic measurement start');
      fastBlinkOnce()
      const { average } = await getDistanceSensor().getAverage()
      mqttClient.publish('cacl2/measure_result', JSON.stringify({
        data: average,
        write: true
      }));
      const elapsedTime = Date.now() - startTime
      await sleep(milliseconds - elapsedTime)
    } catch (error) {
      logger.error(error)
      await sleep(10 * 1000)
    }
  }
}

export async function loop24hour(mqttClient) {
  return loop(mqttClient, 24 * 60 * 60 * 1000)
}

export async function loopHour(mqttClient) {
    return loop(mqttClient, 60 * 60 * 1000)
}
