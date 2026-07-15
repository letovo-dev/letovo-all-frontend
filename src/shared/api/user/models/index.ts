import { addAch } from './addAch';
import { addRole } from './addRole';
import { changeNick } from './changeNick';
import { changePass } from './changePass';
import { getAllUserAchievements } from './getAllUserAchievements';
import { getMessage } from './getMessage';
import { getUserAchievements } from './getUserAchievements';
import { getFullUserData } from './getFullUserData';
import { getUserData } from './getUserData';
import { isUser } from './isUser';
import { setAvatar } from './setAvatar';
import { transferPrepare } from './transferPrepare';
import { transferSend } from './transferSend';
import { getDepartments } from './getDepartments';
import { getDepartmentRoles } from './getDepartmentRoles';
import { getMyTransactions } from './getMyTransactions';
import { uploadPersonalAvatar } from './uploadPersonalAvatar';
import { departmentPayout } from './departmentPayout';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getAllUserAchievements,
  getUserAchievements,
  getFullUserData,
  getUserData,
  isUser,
  setAvatar,
  addRole,
  changeNick,
  changePass,
  transferPrepare,
  transferSend,
  addAch,
  getMessage,
  getDepartments,
  getDepartmentRoles,
  getMyTransactions,
  uploadPersonalAvatar,
  departmentPayout,
};
