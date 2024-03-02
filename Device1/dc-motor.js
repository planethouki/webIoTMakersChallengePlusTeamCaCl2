import { requestGPIOAccess } from "./node_modules/node-web-gpio/dist/index.js";
import sleep from "./sleep.js";

class DcMotor {
  dcMotorPortAddresses = [20, 26]; // Hブリッジコン
  dcMotorPorts = [];

  constructor() {
    this.angle = 0;
  }
  async init() {
    // ポートを初期化するための非同期関数
    const gpioAccess = await requestGPIOAccess(); // thenの前の関数をawait接頭辞をつけて呼び出します。

    for (let i = 0; i < 2; i++) {
      this.dcMotorPorts[i] = gpioAccess.ports.get(this.dcMotorPortAddresses[i]);
      await this.dcMotorPorts[i].export("out");
    }
    for (let i = 0; i < 2; i++) {
      this.dcMotorPorts[i].write(0);
    }
  }

  async free() {
    this.dcMotorPorts[0].write(0);
    this.dcMotorPorts[1].write(0);
  }

  async brake() {
    this.dcMotorPorts[0].write(1);
    this.dcMotorPorts[1].write(1);
    await sleep(300); // 300ms待機してフリー状態にします
    this.dcMotorPorts[0].write(0);
    this.dcMotorPorts[1].write(0);
  }

  async fwd() {
    this.dcMotorPorts[0].write(1);
    this.dcMotorPorts[1].write(0);
  }

  async rev() {
    this.dcMotorPorts[0].write(0);
    this.dcMotorPorts[1].write(1);
  }

}

let instance;

export async function dcMotorInit() {
  instance = new DcMotor()
  await instance.init()
}

export function getDcMotor() {
  return instance
}

