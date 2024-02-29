import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import VL53L0X from "@chirimen/vl53l0x";
import sleep from "./sleep.js";
import { getLogger } from "./logger.js";

const logger = getLogger()

class DistanceSensor {
  isInitialized = false

  constructor() {
    this.i2cAccess = null
    this.port = null
    this.vl = null
  }

  async init() {
    if (this.isInitialized) {
      return
    }
    try {
      this.i2cAccess = await requestI2CAccess(); // I2C を操作する
      this.port = this.i2cAccess.ports.get(1); // 1 番ポートを操作する
      this.vl = new VL53L0X(this.port, 0x29);
      await this.vl.init(); // for Long Range Mode (<2m) : await vl.init(true);
      this.isInitialized = true
    } catch (e) {
      logger.error('Failed to initialize distance sensor')
      logger.error(e)
    }
  }

  async getOnce() {
    const distance = await this.vl.getRange();
    logger.info(`${distance} [mm]`);
    return {
      distance,
      timestamp: Date.now()
    }
  }

  async getAverage(count = 5, interval = 500) {
    const values = []
    for (let i = 0; i < 20; i++) {
      const { distance } = await this.getOnce()
      if (distance < 2000) {
        values.push(distance);
      }
      if (values.length >= count) {
        break;
      }
      await sleep(interval)
    }
    if (values.length === 0) {
      throw new Error('Failed to get distance')
    }
    return {
      average: values.reduce((acc, cur) => acc + cur, 0) / count,
      values
    }
  }
}

let instance = null

export async function init() {
  for (let i = 0; i < 5; i++) {
    try {
      instance = new DistanceSensor()
      await instance.init()
      return;
    } catch(e) {
      await sleep(1000)
    }
  }

  instance = null;
  throw new Error('Failed to initialize distance sensor')
}

export function getDistanceSensor() {
  return instance
}
