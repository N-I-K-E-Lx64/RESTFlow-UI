import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import {restflowAPI} from "./service/restflowAPI";
import taskSliceReducer from "../features/modeling/taskSlice";
import connectorSliceReducer from "../features/modeling/connectorSlice";

export const store = configureStore({
  reducer: {
    tasks: taskSliceReducer,
    connectors: connectorSliceReducer,
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
