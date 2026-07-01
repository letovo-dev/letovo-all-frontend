import type { OneArticle } from '@/shared/stores/articles-store';

type ArticleCategory = {
  category: string;
  category_name: string;
};

type ArticleLike = Omit<
  Partial<OneArticle>,
  'post_id' | 'is_secret' | 'category' | 'likes' | 'dislikes' | 'saved_count'
> & {
  post_id?: string | number;
  is_secret?: string | boolean;
  category?: string | number;
  likes?: string | number;
  dislikes?: string | number;
  saved_count?: string | number;
};

export type CategorySelectItem = {
  value: string;
  label: string;
  text: string;
};

type BuildArticlePayloadValues = {
  isSecret: string;
  category: string;
  articleTitle?: string;
};

type BuildArticlePayloadParams = {
  article?: ArticleLike;
  isEditArticle: boolean;
  values: BuildArticlePayloadValues;
  articlesCategories: ArticleCategory[];
  selectCategoryItems: CategorySelectItem[];
  uploadedFilePath?: string;
};

export type BuildArticlePayloadResult = {
  payload: Partial<OneArticle>;
  isNewRequest: boolean;
  shouldRefreshAfterSuccess: boolean;
};

const NEW_CATEGORY_MARKER = 'new';

const stringValue = (value: string | number | boolean | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return String(value);
};

export const buildArticlePayload = ({
  article,
  isEditArticle,
  values,
  articlesCategories,
  selectCategoryItems,
  uploadedFilePath,
}: BuildArticlePayloadParams): BuildArticlePayloadResult => {
  const selectedCategoryItem = selectCategoryItems.find(item => item.value === values.category);
  const selectedCategory = articlesCategories.find(item => item.category === values.category);
  const isNewCategory =
    selectedCategoryItem?.text === NEW_CATEGORY_MARKER ||
    (!selectedCategory && !selectedCategoryItem);
  const selectedCategoryId = isNewCategory
    ? undefined
    : (selectedCategory?.category ?? selectedCategoryItem?.value);
  const categoryName = isNewCategory
    ? values.category
    : (selectedCategory?.category_name ?? selectedCategoryItem?.label ?? values.category);
  const categoryChanged =
    isEditArticle &&
    (isNewCategory ||
      (!!selectedCategoryId && selectedCategoryId !== stringValue(article?.category)));

  if (isEditArticle) {
    const payload: Partial<OneArticle> = {
      post_id: stringValue(article?.post_id),
      likes: stringValue(article?.likes),
      dislikes: stringValue(article?.dislikes),
      saved_count: stringValue(article?.saved_count),
      text: '',
      is_secret: values.isSecret,
      title: values.articleTitle ?? article?.title ?? '',
      post_path: uploadedFilePath ?? article?.post_path ?? '',
      category_name: categoryName,
      author: article?.author,
      parent_id: article?.parent_id,
      date: article?.date,
    };

    if (selectedCategoryId) {
      payload.category = selectedCategoryId;
    } else {
      delete payload.category;
    }

    return {
      payload,
      isNewRequest: false,
      shouldRefreshAfterSuccess: isNewCategory || categoryChanged,
    };
  }

  const payload: Partial<OneArticle> = {
    title: values.articleTitle ?? '',
    text: '',
    is_secret: values.isSecret,
    category_name: categoryName,
    post_path: uploadedFilePath ?? '',
  };

  if (selectedCategoryId) {
    payload.category = selectedCategoryId;
  }

  return {
    payload,
    isNewRequest: true,
    shouldRefreshAfterSuccess: isNewCategory,
  };
};
