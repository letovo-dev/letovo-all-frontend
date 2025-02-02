import packageJson from '../../package.json';

export class Consts {
  static isEnvDev = process.env.IS_ENV_DEV;

  static authServer = process.env.AUTH_SERVER;
  static version = `ver ${packageJson.version}`;

  static mock = {
    enabled: false,
    delay: 250,
    errorChance: 0,
    assetsRoutes: true,
    assetsPolygons: true,
  };

  static adminRoleId = 10;
  static adminRole = 'Администратор';
  static teacherRole = 'Наставник';
  static studentRole = 'Ученик';
}
