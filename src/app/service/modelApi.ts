import {restflowAPI} from "./restflowAPI";
import {Model} from "../../features/modeling/modelSlice";

type ModelsResponse = Model[];

const modelApi = restflowAPI.injectEndpoints({
	endpoints: (build) => ({
		getModels: build.query<ModelsResponse, void>({
			query: () => 'models',
			providesTags: (result) => result
				? [ ...result.map(({ name }) => ({ type: 'Model' as const, name})), { type: 'Model', id: 'LIST' }]
				: [{ type: 'Model', id: 'LIST' }]
		}),
		getModel: build.query<Model, string>({
			query: (id) => `model/${id}`,
			providesTags: (result, error, id) => [{ type: 'Model', id }],
		}),
		addModel: build.mutation<Model, Partial<Model>>({
			query: (body) => ({
				url: 'model',
				method: 'POST',
				body
			}),
			invalidatesTags: ['Model'],
		}),
	}),
	overrideExisting: true,
});

export const { useGetModelsQuery, useGetModelQuery, useAddModelMutation } = modelApi;
