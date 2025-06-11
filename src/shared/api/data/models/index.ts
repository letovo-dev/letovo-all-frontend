import { getArticlesByCategoryId } from './getArticlesByCategoryId';
import { getArticleMd } from './getArticleMd';
import { getArticlesCategories } from './getArticlesCategories';
import { getAvatars } from './getAvatars';
import { getCurrentNews } from './getCurrentNews';
import { getLimitNews } from './getLimitNews';
import { getLimitNewsComments } from './getLimitNewsComments';
import { getMdMedia } from './getMdMedia';
import { getNewsMedia } from './getNewsMedia';
import { getSavedNews } from './getSavedNews';
import { getTitles } from './getTitles';
import { saveComments } from './saveComments';
import { saveNews } from './saveNews';
import { searchNews } from './searchNews';
import { setDislike } from './setDislike';
import { setLike } from './setLike';
import { renameCategory } from './renameCategory';
import { deleteArticlesCategory } from './deleteArticleCategory';
import { deleteArticle } from './deleteArticle';
import { renameArticle } from './renameArticle';
import { saveArticle } from './saveArticle';

const apiMethods = {
  getAvatars,
  getTitles,
  getCurrentNews,
  getLimitNewsComments,
  getLimitNews,
  getSavedNews,
  getNewsMedia,
  saveNews,
  saveComments,
  setLike,
  setDislike,
  searchNews,
  getArticlesByCategoryId,
  getArticlesCategories,
  getArticleMd,
  getMdMedia,
  renameCategory,
  deleteArticlesCategory,
  deleteArticle,
  renameArticle,
  saveArticle,
};

export default apiMethods;
