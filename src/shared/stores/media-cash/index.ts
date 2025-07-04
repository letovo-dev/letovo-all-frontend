import { create } from 'zustand';

interface MediaCacheState {
  cache: Map<string, string>;
  setCache: (url: string, blobUrl: string) => void;
  getCache: (url: string) => string | null;
}

const useMediaCache = create<MediaCacheState>(set => ({
  cache: new Map<string, string>(),
  setCache: (url: string, blobUrl: string) =>
    set(state => {
      const newCache = new Map(state.cache);
      newCache.set(url, blobUrl);
      return { cache: newCache };
    }),
  getCache: (url: string): string | null => {
    return useMediaCache.getState().cache.get(url) || null;
  },
}));

export default useMediaCache;
