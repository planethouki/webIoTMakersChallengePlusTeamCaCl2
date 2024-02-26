import sleep from './sleep.js'
import { getOnce } from "./distance-sensor.js";

while (true) {
  try {
    const startTime = Date.now()
    const result = await getOnce()
    // todo 散布するかどうかを判定
    // todo 散布する処理を呼ぶ
    const elapsedTime = Date.now() - startTime
    await sleep(24 * 60 * 60 * 1000 - elapsedTime)
  } catch (error) {
    console.error(error)
    await sleep(10 * 1000)
  }
}
