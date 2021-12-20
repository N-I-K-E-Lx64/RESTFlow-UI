import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import {restflowAPI} from "./service/restflowAPI";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [restflowAPI.reducerPath]: restflowAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restflowAPI.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
