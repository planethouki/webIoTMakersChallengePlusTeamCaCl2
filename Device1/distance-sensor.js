import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import VL53L0X from "@chirimen/vl53l0x";
import sleep from "./sleep.js";
import fs from 'fs'

export async function getOnce() {
  const i2cAccess = await requestI2CAccess();
  const port = i2cAccess.ports.get(1);
  const vl = new VL53L0X(port, 0x29);
  await vl.init(); // for Long Range Mode (<2m) : await vl.init(true);
  const distance = await vl.getRange();
  console.log(`${distance} [mm]`);
  return {
    distance,
    timestamp: Date.now()
  }
}

