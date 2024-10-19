import axios from 'axios';
import { WCLEvent } from '../types/WarcraftLogs/types';

export const getWarcraftLogsAccessToken = async (): Promise<string> => {
  const clientId = process.env.WARCRAFT_LOGS_CLIENT_ID;
  const clientSecret = process.env.WARCRAFT_LOGS_CLIENT_SECRET;

  const response = await axios.post(
    'https://www.warcraftlogs.com/oauth/token',
    {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    },
  );

  return response.data.access_token;
};

export const getReportEvents = async (
  reportId: string,
  encounterId: number,
  playerId: number,
  targetId: number,
) => {
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

  return response.data.data.reportData.report.events.data;
};

export const getReportData = async (code: string) => {
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

  return response.data.data.reportData;
};
