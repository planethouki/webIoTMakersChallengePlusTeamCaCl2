export default async function (msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}
