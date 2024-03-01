import {fastBlinkOnce} from "./led-indicator.js";
import {getDistanceSensor} from "./distance-sensor.js";
import {getThermoSensor} from "./thermo-sensor.js";
import {writeBlockchain} from "./blockchain.js";

export async function simpleMeasure(mqttClient) {
  fastBlinkOnce()
  await Promise.all([
    getDistanceSensor().getAverage(),
    getThermoSensor().getAverage()
  ]).then(([distance, thermo]) => {
    mqttClient.publish('cacl2/measure_result', JSON.stringify({
      data: `${distance.average},${thermo.temperature.average},${thermo.humidity.average}`,
      write: true
    }));
    writeBlockchain('measure', `${Date.now()},${distance.average},${thermo.temperature.average},${thermo.humidity.average}`);
  })
}
