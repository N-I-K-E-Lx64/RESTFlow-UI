import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const restflowAPI = createApi({
	baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:8080'}),
	tagTypes: ['UserParam'],
	endpoints: () => ({}),
});
