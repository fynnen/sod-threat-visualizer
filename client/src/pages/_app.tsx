import Layout from "@/components/layout";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import createApolloClient from "../utils/apolloClient";

const client = createApolloClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ApolloProvider>
  );
}
