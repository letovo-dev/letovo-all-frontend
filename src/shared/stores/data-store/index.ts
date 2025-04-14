import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_DATA } from '@/shared/api/data';

interface Author {
  id: string;
  username: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: Author;
  likes: number;
  text: string;
  timestamp: string;
  liked?: boolean;
}

export interface News {
  id: string;
  author: Author;
  topic: string;
  text: string;
  likes: number;
  media: string[];
  dislikes: number;
  comments: Comment[];
  timestamp: string;
  add_files: string[];
  liked?: boolean;
  disliked?: boolean;
}

interface NewsData {
  news: News[];
  subjects: string[];
  saved: News[];
}

export type Params = {
  limit: number;
  skip: number;
};

export type TDataStoreState = {
  loading: boolean;
  error: string;
  data: {
    avatars: string[];
    news: NewsData;
    newsBySubject?: News[];
    filteredNews?: News[];
    openComments: string;
    commentReply: string;
  };
  getAvatars: () => Promise<void>;
  getNews: () => Promise<void>;
  getNewsBySubject: () => Promise<void>;
  getFilteredNews: () => Promise<void>;
  addComment: (comment: string) => Promise<void>;
  like: () => Promise<void>;
  dislike: () => Promise<void>;
  setOpenComments: (id: string) => void;
  setCommentReply: (text: string) => void;
  isFooterHidden: boolean;
  setFooterHidden: (hidden: boolean) => void;
  toggleFooter: () => void;
};

const newsData: NewsData = {
  news: [
    {
      id: 'news_001',
      author: {
        id: 'user_123',
        username: 'Иван_Петров',
        avatar: '',
      },
      add_files: [],
      topic: 'Новые технологии в 2025',
      text: 'Новый ИИ поможет людям быстрее решать задачи.',
      likes: 150,
      media: ['/img/pic1.png', '/img/pic2.png', '/img/pic3.png', '/img/pic4.png', '/img/mov1.mp4'],
      dislikes: 23,
      comments: [
        {
          id: 'comm_001',
          author: { id: 'user_456', username: 'Мария_Иванова', avatar: '' },
          likes: 15,
          text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem nihil officia tempora suscipit facere! Molestiae nostrum commodi consequatur voluptatum minus? Quod nam fugiat, illo eius minus alias pariatur adipisci suscipit!',
          timestamp: '2025-03-20T10:15:00Z',
          liked: true,
        },
        {
          id: 'comm_031',
          author: { id: 'user_456', username: 'Мария_Иванова', avatar: '' },
          likes: 12,
          text: 'Dolorem nihil officia tempora suscipit facere! Molestiae nostrum commodi consequatur voluptatum minus? Quod nam fugiat, illo eius minus alias pariatur adipisci suscipit!',
          timestamp: '2025-03-19T10:15:00Z',
          liked: true,
        },
      ],
      timestamp: '2025-03-20T10:00:00Z',
      disliked: true,
    },
    {
      id: 'news_002',
      author: {
        id: 'user_456',
        username: 'Мария_Иванова',
        avatar: '',
      },
      topic: 'Космические исследования',
      text: 'На Марсе нашли следы воды, это меняет всё!',
      likes: 230,
      media: ['/img/pic1.png', '/img/pic2.png', '/img/pic3.png', '/img/pic4.png', '/img/mov1.mp4'],
      dislikes: 15,
      comments: [],
      timestamp: '2025-03-20T11:00:00Z',
      add_files: [],
    },
    {
      id: 'news_003',
      author: {
        id: 'user_789',
        username: 'Алексей_Сидоров',
        avatar: '',
      },
      topic: 'Экономика будущего',
      text: 'Криптовалюта снова растёт, эксперты в шоке от новых рекордов.',
      likes: 95,
      media: ['/img/pic1.png', '/img/pic2.png', '/img/pic3.png', '/img/pic4.png', '/img/mov1.mp4'],
      dislikes: 45,
      comments: [
        {
          id: 'comm_002',
          author: { id: 'user_123', username: 'Иван_Петров', avatar: '' },
          likes: 8,
          text: 'Невероятно!',
          timestamp: '2025-03-20T12:10:00Z',
          liked: false,
        },
        {
          id: 'comm_0021',
          author: { id: 'user_123', username: 'Иван_Петров', avatar: '' },
          likes: 28,
          text: 'Невероятно но факт!',
          timestamp: '2025-03-20T12:10:00Z',
          liked: true,
        },
        {
          id: 'comm_0022',
          author: { id: 'user_123', username: 'Иван_Петров', avatar: '' },
          likes: 18,
          text: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nobis veniam cumque nesciunt sint laborum ex officiis amet id est doloremque eius praesentium fugit cupiditate eaque a distinctio nihil dolorem aspernatur voluptates incidunt iure molestias, ratione ipsum! Aliquid dignissimos corporis error voluptas beatae. Quibusdam dicta iste possimus quisquam, corrupti, minus unde dolorum nam sunt laudantium velit saepe nobis. Porro, eaque? Totam commodi laudantium voluptas iure iusto. Fugit inventore consequatur veniam officia repellendus voluptates tempore eos, nobis beatae saepe aspernatur dicta quia velit tenetur! Voluptatem in corrupti laborum cupiditate aspernatur facere, aliquam voluptatum ab enim sed fuga illum incidunt molestiae et minima esse iure optio ea, id iusto. Corporis cum alias asperiores exercitationem aut porro blanditiis accusantium laborum, eligendi beatae et officia, distinctio id perspiciatis officiis reiciendis eaque, enim eveniet ipsa! Necessitatibus dolorum, rerum quam laboriosam excepturi reiciendis voluptatibus nemo iusto itaque qui. Delectus fugiat veniam, quis consequatur dolores quam ad molestiae nisi officiis amet obcaecati hic blanditiis sequi ullam ipsam, asperiores et nam. Pariatur rem incidunt eaque accusamus assumenda nostrum optio omnis velit soluta unde numquam, vero ad, harum placeat sit ex beatae inventore maxime dolores tempore corporis atque recusandae magnam! Esse consequuntur doloribus asperiores fugiat, quasi aliquid fuga id laborum, ea officiis magni corrupti, tempora iste aliquam ipsam nemo? Blanditiis et impedit laboriosam aut laborum doloremque in quibusdam quis rerum nam, aliquam totam provident ex quia dicta repellat delectus vitae ipsum minus dolores eum ipsam aperiam repudiandae quam? Obcaecati ipsam neque praesentium nobis quam, aspernatur beatae recusandae, vel dolorem provident perferendis officia? Cum voluptate, officiis optio quasi sed inventore, animi necessitatibus est adipisci quos recusandae fugit repudiandae odit exercitationem dolore vitae illo blanditiis voluptates sequi? Aperiam corporis incidunt, eius deserunt id quibusdam maiores fugit commodi aut illo natus eos laboriosam obcaecati totam voluptates ducimus! Ipsum consequatur neque ea sint doloremque? Id reprehenderit delectus iure atque dicta illum consequuntur sint maiores facere, illo rerum iusto, magni, recusandae cupiditate ab quis tempore hic. Facilis odio porro, adipisci pariatur inventore quis dolores. Quod voluptatibus impedit voluptatum in itaque nihil iusto libero explicabo quia, sint deserunt similique eos a! Deserunt dolorem qui cupiditate sapiente aperiam accusamus laborum ipsum? Suscipit, aliquam non nam illum sunt ipsa assumenda atque ad quia? Optio amet voluptate magni iste aspernatur quasi quas earum repellat iure soluta corporis illo est minus consequuntur ex enim assumenda vitae quibusdam repudiandae quo neque, sunt mollitia itaque! Vitae quam, laudantium asperiores excepturi beatae quia iusto suscipit est quibusdam cum tenetur quos officiis cumque fugiat. Tempora dolorum nobis iusto maiores dolore doloremque cupiditate architecto vitae aliquid veniam voluptatibus, exercitationem magni aperiam impedit iure necessitatibus, laborum consequuntur aut blanditiis facilis! Error repellendus cum, saepe eius rerum corrupti ipsum magni nam doloremque blanditiis, ab nobis vitae officia facilis totam soluta? Aliquid perspiciatis repudiandae eius repellendus cupiditate dolorum dolor minus. Mollitia perferendis dicta velit magni nisi esse ad consectetur eveniet in fugiat sequi voluptate sed placeat ab quos similique, nihil amet quam voluptates reiciendis culpa porro accusantium tempore? Eveniet minima ab dolore sint vel voluptatibus error in facilis!',
          timestamp: '2025-03-20T12:10:00Z',
          liked: true,
        },
      ],
      timestamp: '2025-03-20T12:00:00Z',
      add_files: [],
      liked: true,
    },
    {
      id: 'news_004',
      author: {
        id: 'user_234',
        username: 'Елена_Смирнова',
        avatar: '',
      },
      topic: 'Экология',
      text: 'Учёные создали пластик, который разлагается за месяц в природе.',
      likes: 320,
      media: ['/img/pic1.png', '/img/pic2.png', '/img/pic3.png', '/img/pic4.png', '/img/mov1.mp4'],
      dislikes: 12,
      comments: [],
      timestamp: '2025-03-20T13:00:00Z',
      add_files: [],
    },
    {
      id: 'news_005',
      author: {
        id: 'user_567',
        username: 'Дмитрий_Козлов',
        avatar: '',
      },
      topic: 'Спорт',
      text: ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Hic itaque ullam architecto impedit expedita natus porro similique ex tempora necessitatibus nisi et quasi ipsa minima deserunt sunt laudantium, quam odit.',
      likes: 180,
      media: ['/img/pic1.png', '/img/pic2.png', '/img/pic3.png', '/img/pic4.png', '/img/mov1.mp4'],
      dislikes: 5,
      liked: true,
      comments: [
        {
          id: 'comm_0044',
          author: { id: 'user_789', username: 'Алексей Сидорков', avatar: '' },
          likes: 0,
          text: 'Фантастично!',
          timestamp: '2025-03-18T14:15:00Z',
        },
        {
          id: 'comm_003',
          author: { id: 'user_789', username: 'Алексей_Сидоров', avatar: '' },
          likes: 0,
          text: 'Фантастика!',
          timestamp: '2025-03-20T14:15:00Z',
        },
      ],
      timestamp: '2025-03-20T14:00:00Z',
      add_files: [],
    },
  ],
  subjects: [
    'Clear spark',
    'Sustainum',
    'Climawise',
    'Simple Nourishment',
    'Globalmed',
    'Hydrovision',
  ],
  saved: [
    {
      id: 'news_004',
      author: {
        id: 'user_234',
        username: 'Елена_Смирнова',
        avatar: '',
      },
      topic: 'Экология',
      text: 'Учёные создали пластик, который разлагается за месяц в природе.',
      likes: 320,
      media: ['/img/pic1.png', '/img/pic2.png', '/img/pic3.png', '/img/pic4.png', '/img/mov1.mp4'],
      dislikes: 12,
      comments: [
        {
          id: 'comm_003',
          author: { id: 'user_789', username: 'Алексей_Сидоров', avatar: '' },
          likes: 0,
          text: 'Фантастика!',
          timestamp: '2025-03-20T14:15:00Z',
        },
        {
          id: 'comm_0044',
          author: { id: 'user_789', username: 'Алексей Сидорков', avatar: '' },
          likes: 0,
          text: 'Фантастично!',
          timestamp: '2025-03-18T14:15:00Z',
        },
      ],
      timestamp: '2025-03-20T13:00:00Z',
      add_files: [],
    },
  ],
};

const dataState = { avatars: [], news: newsData };

const initialState = {
  loading: false,
  error: undefined,
  data: dataState,
};

const dataStore = create<TDataStoreState>()(
  immer((set: (partial: Partial<any>) => void, get: () => any) => ({
    ...initialState,
    isFooterHidden: false,
    setFooterHidden: (hidden: boolean) => set({ isFooterHidden: hidden }),
    toggleFooter: () =>
      set((state: TDataStoreState) => ({ isFooterHidden: !state.isFooterHidden })),
    getAvatars: async (): Promise<any> => {
      set({ error: undefined, loading: true });
      try {
        const response = await SERVICES_DATA.Data.getAvatars();
        if (response.success && response.code === 200) {
          const { result } = response?.data as { result: string[] };
          //   dataStore.setState((draft: TDataStoreState) => {
          //     draft.data.avatars = result;
          //   });
          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              avatars: result,
            },
            error: undefined,
          }));
        } else {
          set({ ...initialState, error: response.codeMessage });
        }
      } catch (error) {
        console.error(error);
        set({ ...initialState, error: 'Network or system error' });
      } finally {
        set({ loading: false });
      }
    },
    getNews: async (params: Params): Promise<any> => {
      set({ error: undefined, loading: true });

      set((s: TDataStoreState) => ({
        data: {
          ...s.data,
          news: newsData,
        },
        error: undefined,
      }));
      try {
        const response = await SERVICES_DATA.Data.getNews(params);
        if (response) {
          const { result } = response?.data as NewsData;
          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              news: newsData,
            },
            error: undefined,
          }));
        } else {
          // set({ ...initialState, error: response.codeMessage });
        }
      } catch (error) {
        console.error(error);
        set({ ...initialState, error: 'Network or system error' });
      } finally {
        set({ loading: false });
      }
    },
    resetState: () => {
      set((s: TDataStoreState) => ({
        s,
        ...initialState,
      }));
    },
    setOpenComments: (state: string) => {
      set((s: TDataStoreState) => ({
        data: {
          ...s.data,
          openComments: state,
        },
      }));
    },
    setCommentReply: (text: string) => {
      set((s: TDataStoreState) => ({
        data: {
          ...s.data,
          commentReply: text,
        },
      }));
    },
  })),
);

export default dataStore;
