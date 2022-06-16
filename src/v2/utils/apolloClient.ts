import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { ipcRenderer } from "electron";
import { RetryLink } from "@apollo/client/link/retry";
import { useEffect, useState } from "react";
import { NodeInfo } from "src/config";
import isDev from "electron-is-dev";
import { PreloadEndedDocument, PreloadEndedQuery } from "../generated/graphql";
import type { Update } from "src/main/update";

type Client = ApolloClient<NormalizedCacheObject>;

export default function useApolloClient(): Client | null {
  const [apolloClient, setApolloClient] = useState<Client | null>(null);

  useEffect(() => {
    (async () => {
      const node: NodeInfo = await ipcRenderer.invoke("get-node-info");
      const headlessUrl = `${node.host}:${node.graphqlPort}`;

      const wsLink = new WebSocketLink({
        uri: `ws://${headlessUrl}/graphql`,
        options: {
          reconnect: true,
          connectionCallback() {
            client
              .query<PreloadEndedQuery>({
                query: PreloadEndedDocument,
              })
              .then(({ data }) => {
                const apv = data!.nodeStatus.appProtocolVersion;
                if (!apv) return;
                ipcRenderer.send("encounter different version", {
                  newer: apv.version,
                  extras: apv.extra,
                } as Update);
              });
          },
        },
      });

      const httpLink = new HttpLink({
        uri: `http://${headlessUrl}/graphql`,
      });

      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      );

      const client = new ApolloClient({
        link: ApolloLink.from([new RetryLink(), splitLink]),
        cache: new InMemoryCache(),
        connectToDevTools: !isDev,
      });
      setApolloClient(client);
    })().catch(console.error);
  }, []);

  return apolloClient;
}
