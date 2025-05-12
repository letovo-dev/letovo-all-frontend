export class Utils {
  static isFunction = (o: any) => o !== undefined && o !== null && typeof o === 'function';
  static isIterable = (o: any) => o !== undefined && this.isFunction(o[Symbol.iterator]);
  static removeNulls = (obj: any) => {
    if (obj === null) return undefined;
    if (typeof obj === 'object') for (const key in obj) obj[key] = this.removeNulls(obj[key]);
    return obj;
  };
}

export const generateKey = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2);
};
