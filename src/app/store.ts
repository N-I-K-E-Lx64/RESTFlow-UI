import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import {restflowAPI} from "./service/restflowAPI";
import modelSliceReducer from "../features/modeling/modelSlice";
import selectionSliceReducer from "../features/modeling/selectionSlice";

export const store = configureStore({
  reducer: {
    model: modelSliceReducer,
    selection: selectionSliceReducer,
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
