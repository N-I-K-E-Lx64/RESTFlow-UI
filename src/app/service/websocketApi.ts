import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {Client} from "@stomp/stompjs";

export interface MonitoringInstance {
	wfName: string;
	currentActivity: string;
	wfStatus: string;
	startTime: string;
}

export const websocketApi = createApi({

	baseQuery: fetchBaseQuery({baseUrl: '/'}),
	endpoints: (build) => ({
		getMessages: build.query<MonitoringInstance[], void>({
			// The query is not relevant here as the data will be provided via streaming updates.
			queryFn: () => ({data: []}),
			async onCacheEntryAdded(arg, {updateCachedData, cacheEntryRemoved}) {

				const client = new Client();
				client.configure({
					brokerURL: 'ws://localhost:8080/restflow',
					// debug: msg => console.log(msg),
				});

				client.onConnect = () => {
					client.subscribe('/topic/monitoring', message => {
						const data: MonitoringInstance = JSON.parse(message.body);
						// TODO : Message validation!
						updateCachedData((draft) => {
							// If state contains an element with the same identifier (workflow name) it must be updated!
							if (draft.some((instance: MonitoringInstance) => instance.wfName === data.wfName)) {
								console.log("Update");
								draft
									.filter((instance: MonitoringInstance) => instance.wfName === data.wfName)
									.forEach((instance: MonitoringInstance) => Object.assign(instance, data));
							} else {
								draft.push(data);
							}
						})
					});
				}

				// Attempt to connect
				client.activate();

				await cacheEntryRemoved
				// Perform cleanup steps once the 'cacheEntryRemoved' promise resolves
				client.deactivate().then(() => console.log("Cleanup complete!"));
			},
		}),
	}),
});

export const {useGetMessagesQuery} = websocketApi;
