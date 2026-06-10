import { add } from './add';
import { create } from './create';
import { deleteAchievement } from './delete';
import { department } from './department';
import { info } from './info';
import { list } from './list';
import { pictures } from './pictures';
import { tree } from './tree';
import { user } from './user';

const achievements = {
  add,
  deleteAchievement,
  create,
  pictures,
  tree,
  info,
  department,
  list,
  user,
};

export default achievements;
