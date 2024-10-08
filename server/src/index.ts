import { ApolloServer } from '@apollo/server'; // preserve-line
import { startStandaloneServer } from '@apollo/server/standalone'; // preserve-line
import axios from 'axios';
import dotenv from 'dotenv';
import { getWarcraftLogsAccessToken } from './services/wclService';
import { Report } from './types/types';
dotenv.config();

const typeDefs = `#graphql

  type EnemyNpc {
    id: Int
  }

  type Player {
    id: Int!
    name: String!
  }

  type Encounter {
    id: Int!
    name: String!
    zone: String!
    enemies: [EnemyNpc!]!
    players: [Player!]!
  }

  type Report {
    title: String!
    encounters: [Encounter]!
  }

  type Query {
    report(code: String!): Report
    playerEvents(reportId: String!, playerId: Int!, encounterId: Int!, targetId: Int!): String
  }
`;

export interface GetPlayerEventsParams {
  reportId: string;
  encounterId: number;
  playerId: number;
  targetId: number;
}

const getPlayerEvents = async (
  _: never,
  { reportId, encounterId, playerId, targetId }: GetPlayerEventsParams,
): Promise<string> => {
  const accessToken = await getWarcraftLogsAccessToken();
  const query = `#graphql
    query($reportId: String!, $sourceId: Int!, $fightIds: [Int!], $targetId: Int!) {
      reportData {
        report(code: $reportId) {
          events(
            dataType: All
            fightIDs: $fightIds
            sourceID: $sourceId
            targetID: $targetId
          ) {
            data
          }
        }
      }
    }
  `;

  const response = await axios.post(
    'https://www.warcraftlogs.com/api/v2/client',
    {
      query,
      variables: {
        reportId: reportId,
        sourceId: playerId,
        fightIds: [encounterId],
        targetId: targetId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  console.log(response.data);

  return JSON.stringify(response.data.data.reportData.report.events.data);
};

interface GetReportParams {
  code: string;
}

const getReport = async (
  _: never,
  { code }: GetReportParams,
): Promise<Report> => {
  const accessToken = await getWarcraftLogsAccessToken();
  const query = `#graphql
    query($reportId: String!) {
        reportData {
          report(code: $reportId) {
            title
            masterData {
              actors(type: "Player") {
                id
                name
                type
              }
            }
            fights(killType: Kills) {
              id
              name
              friendlyPlayers
              classicSeasonID
              gameZone {
                name
              }
              enemyNPCs {
                gameID
              }
            }
          }
        }
      }
  `;
  const response = await axios.post(
    'https://www.warcraftlogs.com/api/v2/client',
    {
      query,
      variables: {
        reportId: code,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const players = response.data.data.reportData.report.masterData.actors.map(
    x => {
      return {
        id: x.id,
        name: x.name,
        type: x.type,
      };
    },
  );

  return {
    title: response.data.data.reportData.report.title,
    encounters: response.data.data.reportData.report.fights.map(x => {
      return {
        id: x.id,
        name: x.name,
        zone: x.gameZone.name,
        players: x.friendlyPlayers.map(x => {
          return players.find(player => player.id === x);
        }),
        enemies: x.enemyNPCs.map(x => {
          return { id: x.gameID };
        }),
      };
    }),
  };
};

const resolvers = {
  Query: {
    playerEvents: getPlayerEvents,
    report: getReport,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
