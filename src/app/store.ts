import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { restflowAPI } from './service/restflowAPI';
import modelSliceReducer from '../features/modeling/slices/modelSlice';
import selectionSliceReducer from '../features/modeling/slices/selectionSlice';
import apiSlice from '../features/modeling/slices/apiSlice';

export const store = configureStore({
  reducer: {
    model: modelSliceReducer,
    selection: selectionSliceReducer,
    apis: apiSlice,
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
