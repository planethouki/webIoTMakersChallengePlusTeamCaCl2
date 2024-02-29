import pino from 'pino'

const logger = pino()

export function getLogger() {
  return logger
}
