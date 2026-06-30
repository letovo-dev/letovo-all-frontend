type ArticleCategory = {
  category: string;
  category_name: string;
};

type ArticleLike = {
  post_id?: string | number;
  post_path?: string;
  is_secret?: string | boolean;
  title?: string;
  text?: string;
  category?: string | number;
  category_name?: string;
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
  payload: Partial<ArticleLike>;
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
    (isNewCategory || (!!selectedCategoryId && selectedCategoryId !== article?.category));

  if (isEditArticle) {
    const payload: Partial<ArticleLike> = {
      ...article,
      post_id: stringValue(article?.post_id),
      likes: stringValue(article?.likes),
      dislikes: stringValue(article?.dislikes),
      saved_count: stringValue(article?.saved_count),
      text: '',
      is_secret: values.isSecret,
      title: values.articleTitle ?? article?.title ?? '',
      post_path: uploadedFilePath ?? article?.post_path ?? '',
      category_name: categoryName,
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

  const payload: Partial<ArticleLike> = {
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
