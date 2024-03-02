import {fastBlinkOnce} from "./led-indicator.js";
import {getDistanceSensor} from "./distance-sensor.js";
import {getThermoSensor} from "./thermo-sensor.js";
import {writeBlockchain} from "./blockchain.js";
import {getWeather} from "./weather.js";
import {getLogger} from "./logger.js";

const logger = getLogger()

export async function simpleMeasure(mqttClient) {
  fastBlinkOnce()
  await Promise.all([
    getDistanceSensor().getAverage(),
    getThermoSensor().getAverage(),
    getWeather()
  ]).then(([distance, thermo, weather]) => {
    const mqttData = `${distance.average},${thermo.temperature.average},${thermo.humidity.average},${weather.weatherCode}`
    const blockChainData = `${Date.now()},${mqttData}`
    mqttClient.publish('cacl2/measure_result', JSON.stringify({
      data: mqttData,
      write: true
    }));
    logger.info(`MQTT Publish: ${mqttData}`);
    writeBlockchain('measure', blockChainData);
  })
}
