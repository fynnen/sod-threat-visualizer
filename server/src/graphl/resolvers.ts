import type { IResolvers } from '@graphql-tools/utils';
import { reportResolver } from './report/resolvers';

export const resolversMap: IResolvers[] = [reportResolver];
