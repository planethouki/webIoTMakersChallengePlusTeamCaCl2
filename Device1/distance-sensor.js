import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import VL53L0X from "@chirimen/vl53l0x";
import sleep from "./sleep.js";

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
      console.error('Failed to initialize distance sensor')
      console.error(e)
    }
  }

  async getOnce() {
    const distance = await this.vl.getRange();
    console.log(`${distance} [mm]`);
    return {
      distance,
      timestamp: Date.now()
    }
  }

  async getAverage(count = 5, interval = 500) {
    const values = []
    for (let i = 0; i < count; i++) {
      const result = await this.getOnce()
      values.push(result.distance)
      await sleep(interval)
    }
    return {
      average: values.reduce((acc, cur) => acc + cur, 0) / count,
      values
    }
  }
}

let instance = null
let isInTryGet = false

async function tryGetSingle() {
  if (isInTryGet) {
    throw new Error('Initialization of distance sensor is already in progress')
  }
  isInTryGet = true
  try {
    await tryInit()
    isInTryGet = false
  } catch (e) {
    isInTryGet = false
    throw e
  }
}

async function tryInit() {
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

export async function getDistanceSensor() {
  if (instance === null) {
    await tryGetSingle()
  }
  return instance
}
