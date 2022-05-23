import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import { restflowAPI } from './restflowAPI';

export interface MonitoringInstance {
  wfName: string;
  currentActivity: string;
  wfStatus: string;
  startTime: string;
}

const websocketApi = restflowAPI.injectEndpoints({
  endpoints: (build) => ({
    getMessages: build.query<MonitoringInstance[], void>({
      // The query is not relevant here as the data will be provided via streaming updates.
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(arg, { updateCachedData, cacheEntryRemoved }) {
        const client = new Client();
        client.configure({
          brokerURL: 'ws://localhost:8080/restflow',
          connectHeaders: {
            login: uuidv4(),
          },
          // debug: msg => console.log(msg),
        });

        client.onConnect = () => {
          client.subscribe('/user/queue/monitoring', (message) => {
            const data: MonitoringInstance = JSON.parse(message.body);

            updateCachedData((draft) => {
              // This cache update is only relevant when the client connects for the first time, so updates to existing data is unnecessary
              draft.push(data);
            });
          });

          client.subscribe('/topic/monitoring', (message) => {
            const data: MonitoringInstance = JSON.parse(message.body);

            updateCachedData((draft) => {
              // If state contains an element with the same identifier (workflow name) it must be updated!
              if (
                draft.some(
                  (instance: MonitoringInstance) =>
                    instance.wfName === data.wfName
                )
              ) {
                console.log('Update');
                draft
                  .filter(
                    (instance: MonitoringInstance) =>
                      instance.wfName === data.wfName
                  )
                  .forEach((instance: MonitoringInstance) =>
                    Object.assign(instance, data)
                  );
              } else {
                draft.push(data);
              }
            });
          });

          client.publish({
            destination: '/app/reqMonitoring',
            body: 'Hello Stomp',
          });
        };

        // Attempt to connect
        client.activate();

        await cacheEntryRemoved;
        // Perform cleanup steps once the 'cacheEntryRemoved' promise resolves
        client.deactivate().then(() => console.log('Cleanup complete!'));
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetMessagesQuery } = websocketApi;
