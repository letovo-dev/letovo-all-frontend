export class Utils {
  static dateExpired = (date: string | Date) => new Date(date.toString()).valueOf() < Date.now();
  static isFunction = (o: any) => o !== undefined && o !== null && typeof o === 'function';
  static isIterable = (o: any) => o !== undefined && this.isFunction(o[Symbol.iterator]);
  static removeNulls = (obj: any) => {
    if (obj === null) return undefined;
    if (typeof obj === 'object') for (const key in obj) obj[key] = this.removeNulls(obj[key]);
    return obj;
  };
}

const backErr = (e: any) => {
  try {
    return e.response.data.message;
  } catch (_) {
    try {
      return e.message;
    } catch (__) {
      return e;
    }
  }
};
