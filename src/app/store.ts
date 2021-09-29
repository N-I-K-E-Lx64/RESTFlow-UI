import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import {websocketApi} from "../features/websocket/test";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [websocketApi.reducerPath]: websocketApi.reducer,
  },
  middleware: (getDefaultMiddleware => getDefaultMiddleware().concat(websocketApi.middleware))
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
