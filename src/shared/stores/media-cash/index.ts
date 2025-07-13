import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoCacheState {
  loadedVideos: string[];
  markAsLoaded: (src: string) => void;
}

export const useVideoCacheStore = create<VideoCacheState>()(
  persist(
    (set, get) => ({
      loadedVideos: [],
      markAsLoaded: (src: string) => {
        const current = get().loadedVideos;
        if (!current.includes(src)) {
          set({ loadedVideos: [...current, src] });
        }
      },
    }),
    {
      name: 'video-cache',
      partialize: state => ({ loadedVideos: state.loadedVideos }), // только список
    },
  ),
);

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// interface VideoCacheState {
//   loadedVideos: string[];
//   markAsLoaded: (src: string) => void;
//   clearCache: () => void;
// }

// export const useVideoCacheStore = create<VideoCacheState>()(
//   persist(
//     (set, get) => ({
//       loadedVideos: [],
//       markAsLoaded: (src: string) => {
//         const current = get().loadedVideos;
//         console.log('markAsLoaded:', { src, currentLength: current.length });
//         if (!current.includes(src)) {
//           set({ loadedVideos: [...current, src] });
//         }
//       },
//       clearCache: () => {
//         set({ loadedVideos: [] });
//         console.log('Loaded videos cache cleared');
//       },
//     }),
//     {
//       name: 'video-cache',
//       partialize: state => ({ loadedVideos: state.loadedVideos }),
//     },
//   ),
// );
