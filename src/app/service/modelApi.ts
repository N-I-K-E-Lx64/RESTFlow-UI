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
              'Model',
            ]
          : ['Model'],
    }),
    addModel: build.mutation<Model, Partial<Model>>({
      query: (body) => ({
        url: '/model',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Model'],
    }),
    updateModel: build.mutation<Model, Partial<Model>>({
      query: (body) => ({
        url: `/model/${body.id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Model'],
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
  useAddModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
} = modelApi;
