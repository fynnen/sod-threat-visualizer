import axios from 'axios';

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

type DetailedReportForPlayerParams = {
  reportId: string;
  encounterId: number;
  playerId: number;
  targetId: number;
};

export const getDetailedReportForPlayer = async ({
  reportId,
  encounterId,
  playerId,
  targetId,
}: DetailedReportForPlayerParams) => {
  const accessToken = await getWarcraftLogsAccessToken();
  const query = `#graphql
    query($reportId: String!, $sourceId: Int!, $fightIds: [Int!], $targetId: Int!) {
      reportData {
        report(code: $reportId) {
          masterData {
            actors(type: "Player") {
              id
              name
              type
              subType
            }
          }
          events(
            dataType: All
            fightIDs: $fightIds
            sourceID: $sourceId
            targetID: $targetId
          ) {
            data
          }
          fights(fightIDs: $fightIds) {
              id
              name
              friendlyPlayers
              classicSeasonID
              startTime
              gameZone {
                name
              }
              enemyNPCs {
                gameID
                id
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

  return response.data.data.reportData.report;
};

export const getReportSummary = async (reportId: string) => {
  const accessToken = await getWarcraftLogsAccessToken();
  const query = `#graphql
    query($reportId: String!) {
        reportData {
          report(code: $reportId) {
            title
            masterData {
              actors {
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
              startTime
              gameZone {
                name
              }
              enemyNPCs {
                gameID
                id
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
        reportId: reportId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data.data.reportData.report;
};
