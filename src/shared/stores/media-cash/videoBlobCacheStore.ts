import { create } from 'zustand';

interface VideoBlobSessionCache {
  blobMap: Map<string, Blob>;
  getCachedVideo: (src: string) => Blob | undefined;
  setCachedVideo: (src: string, blob: Blob) => void;
  clearCache: () => void;
}

export const useVideoSessionCache = create<VideoBlobSessionCache>()((set, get) => ({
  blobMap: new Map<string, Blob>(),
  getCachedVideo: (src: string) => {
    const blob = get().blobMap.get(src);
    // console.log('getCachedVideo:', {
    //   src,
    //   found: !!blob,
    //   blobSize: blob?.size,
    //   blobType: blob?.type,
    // });
    return blob;
  },
  setCachedVideo: (src: string, blob: Blob) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'application/octet-stream'];
    if (!validTypes.includes(blob.type) && !blob.type.startsWith('video/')) {
      console.warn('Invalid blob type:', { src, blobType: blob.type, blobSize: blob.size });
      return;
    }
    set(state => ({
      blobMap: new Map(state.blobMap).set(src, blob),
    }));
    // console.log('setCachedVideo: blob stored for', src, 'size:', blob.size, 'type:', blob.type);
  },
  clearCache: () => {
    set({ blobMap: new Map<string, Blob>() });
    // console.log('Video session cache cleared');
  },
}));
