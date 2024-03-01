import sleep from './sleep.js'
import { getLogger } from "./logger.js";
import { simpleMeasure } from "./measure-util.js";

const logger = getLogger()

async function loop(mqttClient, milliseconds) {
  while (true) {
    try {
      const startTime = Date.now()
      logger.info('Periodic measurement start');
      await simpleMeasure(mqttClient)
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
