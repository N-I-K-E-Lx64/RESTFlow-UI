import {restflowAPI} from "../../app/service/restflowAPI";

export interface Variable {
	name: string,
	type: string,
	value: string
}

export interface UserParameterMessage {
	instanceId: string,
	parameter: string,
	value: any
}

const userVariableApi = restflowAPI.injectEndpoints({
	endpoints: (build) => ({
		getSuspendedWorkflows: build.query<string[], void>({
			query: () => '/workflow/suspendedWorkflows'
		}),
		getVariables: build.query<Variable[], string>({
			query: (workflowId: string) => `/workflow/variables/${workflowId}`,
		}),
		getUserParams: build.query<UserParameterMessage[], string>({
			query: (workflowId: string) => `/workflow/userParams/${workflowId}`,
			providesTags: (result) =>
				result ? [...result.map(({ parameter }) => ({ type: 'UserParam' as const, parameter})), 'UserParam'] : ['UserParam'],
		}),
		updateUserParam: build.mutation<void, Partial<UserParameterMessage> & Pick<UserParameterMessage, 'instanceId'>>({
			query: ({ instanceId, ...patch }) => ({
				url: `/workflow/setUserParameter/${instanceId}`,
				method: 'PATCH',
				body: patch
			}),
			invalidatesTags: ['UserParam'],
		})
	}),
	overrideExisting: true,
});

export const { useGetSuspendedWorkflowsQuery, useGetVariablesQuery, useGetUserParamsQuery, useUpdateUserParamMutation } = userVariableApi;
