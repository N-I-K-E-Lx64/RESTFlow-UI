import { restflowAPI } from './restflowAPI';
import { Model } from '../../model/types';

type ModelsResponse = Model[];

const modelApi = restflowAPI.injectEndpoints({
  endpoints: (build) => ({
    getModels: build.query<ModelsResponse, void>({
      query: () => '/models',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Model' as const, id })),
              { type: 'Model', id: 'LIST' },
            ]
          : [{ type: 'Model', id: 'LIST' }],
    }),
    getModelById: build.query<Model, string>({
      query: (id) => ({
        url: `/model/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Model', id }],
    }),
    addModel: build.mutation<Model, Partial<Model>>({
      query: (body) => ({
        url: '/model',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Model', id: 'LIST' }],
    }),
    updateModel: build.mutation<Model, Partial<Model>>({
      query: (body) => ({
        url: `/model`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Model', id }],
    }),
    deleteModel: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `model/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Model', id }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetModelsQuery,
  useGetModelByIdQuery,
  useAddModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
} = modelApi;
