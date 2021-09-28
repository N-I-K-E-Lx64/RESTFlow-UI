import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {RxStomp, RxStompState} from "@stomp/rx-stomp";
import {map} from "rxjs/operators";

interface Response {
	message: string
}

export const websocketApi = createApi({

	baseQuery: fetchBaseQuery({baseUrl: '/'}),
	endpoints: (build) => ({
		getMessages: build.query<Response[], void>({
			// The query is not relevant here as the data will be provided via streaming updates.
			queryFn: () => ({data: []}),
			async onCacheEntryAdded(arg, {updateCachedData, cacheEntryRemoved}) {

				const rxStomp = new RxStomp();
				rxStomp.configure({
					brokerURL: 'ws://localhost:8080/websocket-test',
					// debug: msg => console.log(msg),
				});

				// Attempt to connect
				rxStomp.activate();

				// Subscribe to the connected Observable to get notified when the websocket is connected
				rxStomp.connected$.subscribe((state: RxStompState) => {

					rxStomp.watch('/topic/test')
						.pipe(map((message: any) => {
							return JSON.parse(message.body)
						}))
						.subscribe((payload: any) => {
							console.log(payload);
							updateCachedData((draft) => {
								draft.push(payload);
							})
						});

					if (state === RxStompState.OPEN) {
						rxStomp.publish({destination: '/app/hello', body: JSON.stringify({username: 'test'})});
					}
				})

				await cacheEntryRemoved
				// Perform cleanup steps once the 'cacheEntryRemoved' promise resolves
				rxStomp.deactivate().then(() => console.log("Cleanup complete!"));
			},
		}),
	}),
});

export const {useGetMessagesQuery} = websocketApi;
