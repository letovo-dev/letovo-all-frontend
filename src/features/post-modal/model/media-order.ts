export interface UploadMediaFile {
  uid: string;
  response?: string | { file?: unknown };
  url?: string;
  status?: string;
}

export const sortFilesByUploadOrder = <T extends { uid: string }>(
  files: T[],
  uploadOrder: ReadonlyMap<string, number>,
): T[] =>
  files
    .map((file, currentIndex) => ({ file, currentIndex }))
    .sort((left, right) => {
      const leftOrder = uploadOrder.get(String(left.file.uid));
      const rightOrder = uploadOrder.get(String(right.file.uid));

      if (leftOrder === undefined && rightOrder === undefined) {
        return left.currentIndex - right.currentIndex;
      }
      if (leftOrder === undefined) {
        return 1;
      }
      if (rightOrder === undefined) {
        return -1;
      }
      return leftOrder - rightOrder;
    })
    .map(({ file }) => file);

export const mediaPathsFromUploadFiles = (files: UploadMediaFile[]): string[] =>
  files.flatMap(file => {
    if (file.status && file.status !== 'done') return [];
    const responsePath =
      typeof file.response === 'object' && file.response !== null
        ? file.response.file
        : file.response;
    const mediaPath = responsePath ?? file.url;

    return typeof mediaPath === 'string' && mediaPath.length > 0 ? [mediaPath] : [];
  });
