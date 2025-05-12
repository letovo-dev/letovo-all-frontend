export function extractImageUrls(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}
