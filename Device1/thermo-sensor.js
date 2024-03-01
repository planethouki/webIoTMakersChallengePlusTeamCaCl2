import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import SHT30 from "@chirimen/sht30";
import sleep from "./sleep.js";
import { getLogger } from "./logger.js";

const logger = getLogger()

class ThermoSensor {
  isInitialized = false

  constructor() {
    this.i2cAccess = null
    this.port = null
    this.sh = null
  }

  async init() {
    if (this.isInitialized) {
      return
    }
    try {
      this.i2cAccess = await requestI2CAccess(); // I2C を操作する
      this.port = this.i2cAccess.ports.get(1); // 1 番ポートを操作する
      this.sh = new SHT30(this.port, 0x44);
      await this.sh.init(); // for Long Range Mode (<2m) : await vl.init(true);
      this.isInitialized = true
    } catch (e) {
      logger.error('Failed to initialize distance sensor')
      logger.error(e)
    }
  }

  async getOnce() {
    const { humidity, temperature } = await this.sh.readData();
    logger.info([
        `Humidity: ${humidity.toFixed(2)}%`,
        `Temperature: ${temperature.toFixed(2)} degree`
      ].join(", "));
    return {
      temperature,
      humidity,
      timestamp: Date.now()
    }
  }

  async getAverage(count = 5, interval = 500) {
    const temperatureData = []
    const humidityData = []
    for (let i = 0; i < 20; i++) {
      const { temperature, humidity } = await this.getOnce()
      temperatureData.push(temperature);
      humidityData.push(humidity);
      if (temperatureData.length >= count && humidityData.length >= count) {
        break;
      }
      await sleep(interval)
    }
    if (temperatureData.length === 0 || humidityData.length === 0) {
      throw new Error('Failed to get temperature and humidity')
    }
    return {
      temperature: {
        average: temperatureData.reduce((acc, cur) => acc + cur, 0) / temperatureData.length,
        values: temperatureData
      },
      humidity: {
        average: humidityData.reduce((acc, cur) => acc + cur, 0) / humidityData.length,
        values: humidityData
      }
    }
  }
}

let instance = null

export async function init() {
  for (let i = 0; i < 5; i++) {
    try {
      instance = new ThermoSensor()
      await instance.init()
      return;
    } catch(e) {
      await sleep(1000)
    }
  }

  instance = null;
  throw new Error('Failed to initialize thermo sensor')
}

export function getThermoSensor() {
  return instance
}
