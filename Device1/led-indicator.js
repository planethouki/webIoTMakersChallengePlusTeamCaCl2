import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js"; // WebGPIO を使えるようにするためのライブラリをインポート
import sleep from './sleep.js'

class LedIndicator {

  portState = 0
  isInitialized = false

  constructor() {
    this.gpioAccess = null
    this.port = null
  }

  async init() {
    if (this.isInitialized) {
      return
    }
    try {
      this.gpioAccess = await requestGPIOAccess(); // GPIO を操作する
      this.port = this.gpioAccess.ports.get(26); // 26 番ポートを操作する
      await this.port.export("out"); // ポートを出力モードに設定
      await this.port.write(0);
      this.isInitialized = true
    } catch (e) {
      console.error('Failed to initialize LED indicator')
      console.error(e)
    }
  }

  async toggle() {
    await this.port.write(this.portState === 0 ? 1 : 0)
    this.portState = this.portState === 0 ? 1 : 0
  }

  async on() {
    await this.port.write(1); // LEDを点灯
    this.portState = 1
  }

  async off() {
    await this.port.write(0); // LEDを消灯
    this.portState = 0
  }
}

let instance = null

export async function getLedIndicator() {
  if (instance === null) {
    instance = new LedIndicator()
    await instance.init()
  }
  return instance
}


let isStartedLoopBlink = false
let loopBlinkInterval = 1000

export async function loopBlink(time = 1000) {
  loopBlinkInterval = time
  if (isStartedLoopBlink) {
    return
  }

  isStartedLoopBlink = true

  while (true) {
    const startTs = Date.now()
    let elapsed = 0
    try {
      const ledIndicator = await getLedIndicator()
      await ledIndicator.toggle()
      elapsed = Date.now() - startTs
    } catch(e) {
      console.error(e)
    }
    await sleep(Math.max(loopBlinkInterval - elapsed, 0))
  }
}


export async function fastBlinkOnce(duration = 1000) {
  try {
    let elapsedTime = 0
    while (elapsedTime < duration) {
      const startTime = Date.now()
      const ledIndicator = await getLedIndicator()
      await ledIndicator.toggle()
      await sleep(100)
      elapsedTime += Math.max(Date.now() - startTime, 100)
    }
  } catch(e) {
    console.error(e)
  }
}
