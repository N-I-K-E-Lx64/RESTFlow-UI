import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store';

export type Api = {
  fileName: string;
  resources: string[];
};

const apiAdapter = createEntityAdapter<Api>({
  selectId: (api) => api.fileName,
});

const apiSlice = createSlice({
  name: 'apis',
  initialState: apiAdapter.getInitialState(),
  reducers: {
    apisSet: apiAdapter.setAll,
  },
});

export const { apisSet } = apiSlice.actions;

export const { selectAll: selectApis } = apiAdapter.getSelectors(
  (state: RootState) => state.apis
);

export default apiSlice.reducer;
