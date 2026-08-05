import { configureStore } from '@reduxjs/toolkit';
import { podcastsApi } from './podcastsApi';

export const store = configureStore({
  reducer: {
    [podcastsApi.reducerPath]: podcastsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(podcastsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
