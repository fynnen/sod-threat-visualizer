import { makeExecutableSchema } from '@graphql-tools/schema';

import { resolversMap } from './resolvers';
import { typeDefs } from './typeDefs';

export const schema = makeExecutableSchema({
  resolvers: resolversMap,
  typeDefs,
});
