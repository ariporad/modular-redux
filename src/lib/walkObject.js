/**
 * Created by Ari on 8/27/15.
 */
export default function walkObject(obj, handler) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] === 'object') {
        walkObject(obj[property], handler);
      } else {
        obj[property] = handler(obj[property]);
      }
    }
  }
}
