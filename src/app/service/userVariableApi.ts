import { restflowAPI } from './restflowAPI';

export interface Variable {
  name: string;
  type: string;
  value: string;
}

export interface UserParameterMessage {
  instanceId: string;
  parameter: string;
  value: any;
}

const userVariableApi = restflowAPI.injectEndpoints({
  endpoints: (build) => ({
    getSuspendedWorkflows: build.query<string[], void>({
      query: () => '/suspendedWorkflows',
      providesTags: () => [{ type: 'SuspendedWorkflows', id: 'LIST' }],
    }),
    getVariables: build.query<Variable[], string>({
      query: (workflowId: string) => `/variables/${workflowId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ name }) => ({
                type: 'Variable' as const,
                name,
              })),
              { type: 'Variable', id: 'LIST' },
            ]
          : [{ type: 'Variable', id: 'List' }],
    }),
    getUserParams: build.query<UserParameterMessage[], string>({
      query: (workflowId: string) => `/userParams/${workflowId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ parameter }) => ({
                type: 'UserParam' as const,
                parameter,
              })),
              { type: 'UserParam', id: 'LIST' },
            ]
          : [{ type: 'UserParam', id: 'LIST' }],
    }),
    updateUserParam: build.mutation<
      void,
      Partial<UserParameterMessage> & Pick<UserParameterMessage, 'instanceId'>
    >({
      query: ({ instanceId, ...patch }) => ({
        url: `/setUserParameter/${instanceId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [
        { type: 'UserParam', id: 'LIST' },
        { type: 'Variable', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSuspendedWorkflowsQuery,
  useGetVariablesQuery,
  useGetUserParamsQuery,
  useUpdateUserParamMutation,
} = userVariableApi;
