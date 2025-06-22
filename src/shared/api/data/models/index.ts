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
import { createNews } from './createNews';
import { deleteNews } from './deleteNews';
import { editNews } from './editNews';
import { getAllPostsAuthors } from './getAllPostsAuthors';
import { updateArticle } from './updateArticle';

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
  createNews,
  editNews,
  deleteNews,
  getAllPostsAuthors,
  updateArticle,
};

export default apiMethods;
