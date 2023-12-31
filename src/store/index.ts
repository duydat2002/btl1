import {configureStore} from '@reduxjs/toolkit';
import themeSlice from './theme.slice';
import userSlice from './user.slice';
import projectsSlice from './projects.slice';
import netInforSlice from './netInfor.slice';
import colleaguesSlice from './colleagues.slice';
import tasksSlice from './tasks.slice';
import notificationsSlice from './notifications.slice';
import settingSlice from './setting.slice';

export const store = configureStore({
  reducer: {
    theme: themeSlice,
    netInfo: netInforSlice,
    user: userSlice,
    projects: projectsSlice,
    tasks: tasksSlice,
    colleagues: colleaguesSlice,
    notifications: notificationsSlice,
    setting: settingSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
