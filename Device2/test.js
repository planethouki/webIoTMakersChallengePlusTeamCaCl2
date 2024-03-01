import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import PCA9685 from "@chirimen/pca9685";
import { requestGPIOAccess } from "./node_modules/node-web-gpio/dist/index.js";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const dcMotorPortAddresses = [20, 21]; // HブリッジコントローラをつなぐGPIOポート番号
let dcMotorPorts;
let pca9685;

servo();

// DC motor control
async function dcMotorInit() {
  // ポートを初期化するための非同期関数
  const gpioAccess = await requestGPIOAccess(); // thenの前の関数をawait接頭辞をつけて呼び出します。
  dcMotorPorts = [];

  for (let i = 0; i < 2; i++) {
    dcMotorPorts[i] = gpioAccess.ports.get(dcMotorPortAddresses[i]);
    await dcMotorPorts[i].export("out");
  }
  for (let i = 0; i < 2; i++) {
    dcMotorPorts[i].write(0);
  }
}

async function servoMotorInit() {
  const i2cAccess = await requestI2CAccess();
  const port = i2cAccess.ports.get(1);
  pca9685 = new PCA9685(port, 0x40);
  // servo setting for sg90
  // Servo PWM pulse: min=0.0011[sec], max=0.0019[sec] angle=+-60[deg]
  await pca9685.init(0.001, 0.002, 30);
}

async function free() {
  dcMotorPorts[0].write(0);
  dcMotorPorts[1].write(0);
}

async function brake() {
  dcMotorPorts[0].write(1);
  dcMotorPorts[1].write(1);
  await sleep(300); // 300ms待機してフリー状態にします
  dcMotorPorts[0].write(0);
  dcMotorPorts[1].write(0);
}

async function fwd() {
  dcMotorPorts[0].write(1);
  dcMotorPorts[1].write(0);
}

async function rev() {
  dcMotorPorts[0].write(0);
  dcMotorPorts[1].write(1);
}

async function main() {
  for (;;) {
    await free();
    await pca9685.setServo(0, -30);
    console.log("-30 deg");
    await sleep(1000);
    await fwd();
    await sleep(5000);
    await brake();
    await sleep(1000);
    await pca9685.setServo(0, 30);
    console.log("30 deg");
    await sleep(1000);
  }
}

await Promise.all([servoMotorInit(), dcMotorInit()]);
main()
