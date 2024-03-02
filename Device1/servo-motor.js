import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import PCA9685 from "@chirimen/pca9685";
import { getLogger } from "./logger.js";

const logger = getLogger()

class ServoMotor {
  async init() {
    const i2cAccess = await requestI2CAccess();
    const port = i2cAccess.ports.get(1);
    this.pca9685 = new PCA9685(port, 0x40);
    // servo setting for sg90
    // Servo PWM pulse: min=0.0011[sec], max=0.0019[sec] angle=+-60[deg]
    await this.pca9685.init(0.001, 0.002, 30);
  }

  async setServo(a, angle) {
    logger.info(`Set Servo: ${a}, ${angle}`)
    await this.pca9685.setServo(a, angle);
  }
}

let instance;

export async function servoMotorInit() {
  instance = new ServoMotor()
  await instance.init()
}

export function getServoMotor() {
  return instance
}

