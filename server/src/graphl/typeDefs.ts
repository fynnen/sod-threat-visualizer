import { reportTypeDefs } from './report/typeDefs';

const baseTypeDefs = `#graphql
  type Query
  schema {
    query: Query
  }
`;

export const typeDefs = [baseTypeDefs, reportTypeDefs];
