import axios from 'axios';
import { getLogger } from "./logger.js";

const logger = getLogger();

export async function getWeather() {
  const apiUrl = process.env.WEATHER_URL
  const weatherData = await axios.get(apiUrl).then((res) => res.data)
  logger.info(weatherData);
  return {
    weatherCode: weatherData.current.weather_code
  }
}
