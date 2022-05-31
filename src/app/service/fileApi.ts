import { restflowAPI } from './restflowAPI';
import { FileUpload, RAMLFile } from '../../model/types';

const fileApi = restflowAPI.injectEndpoints({
  endpoints: (build) => ({
    getApiResources: build.query<RAMLFile[], string>({
      query: (modelId) => `/ramlFiles/${modelId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ fileName }) => ({
                type: 'Raml' as const,
                fileName,
              })),
              'Raml',
            ]
          : ['Raml'],
    }),
    uploadFile: build.mutation<RAMLFile[], FileUpload>({
      query: (body) => ({
        url: `/uploadFile/${body.modelId}`,
        method: 'PUT',
        body: body.files,
      }),
      invalidatesTags: ['Raml'],
    }),
  }),
});

export const { useGetApiResourcesQuery, useUploadFileMutation } = fileApi;
