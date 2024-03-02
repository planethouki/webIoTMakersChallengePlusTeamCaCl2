import sleep from './sleep.js'
import { getLogger } from "./logger.js";
import { simpleMeasure } from "./measure-util.js";
import axios from 'axios'

const logger = getLogger()

async function loop(mqttClient, milliseconds, isAnalyze = false) {
  while (true) {
    try {
      const startTime = Date.now()
      logger.info('Periodic measurement start');
      await simpleMeasure(mqttClient)
      if (isAnalyze) {
        await axios.put('https://team-cacl2.netlify.app/.netlify/functions/analyze')
      }
      const elapsedTime = Date.now() - startTime
      await sleep(milliseconds - elapsedTime)
    } catch (error) {
      logger.error(error)
      await sleep(10 * 1000)
    }
  }
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function loop24hour4am(mqttClient) {
  const now = new Date()
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 19, 0, 0));
  if (now.getUTCHours() >= 19) {
    // すでにJST午前4時を過ぎている場合は、次の日の午前4時を設定
    utcDate.setUTCDate(utcDate.getUTCDate() + 1);
  }
  await sleep(utcDate.getTime() - now.getTime())
  return loop(mqttClient, 24 * 60 * 60 * 1000, true)
}

export async function loopHour(mqttClient) {
  await sleep(getRandomInteger(3000, 10000))
  return loop(mqttClient, 60 * 60 * 1000)
}

