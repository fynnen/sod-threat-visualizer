import { ThreatProcessorFactory } from '../../services/threatProcessors/threatProcessorFactory';
import {
  getReportData,
  getReportEvents,
  getWarcraftLogsAccessToken,
} from '../../services/wclService';
import { Report, ThreatEvent } from '../../types/types';
import { WCLEvent } from '../../types/WarcraftLogs/types';

export interface GetPlayerEventsParams {
  reportId: string;
  encounterId: number;
  playerId: number;
  targetId: number;
}

const getPlayerThreatEvents = async (
  _: never,
  { reportId, encounterId, playerId, targetId }: GetPlayerEventsParams,
): Promise<ThreatEvent[]> => {
  const events = await getReportEvents(
    reportId,
    encounterId,
    playerId,
    targetId,
  );

  const processor = ThreatProcessorFactory.getProcessor(
    'Rogue',
    events as WCLEvent[],
  );

  return processor.processLog();
};

const getPlayerEvents = async (
  _: never,
  { reportId, encounterId, playerId, targetId }: GetPlayerEventsParams,
): Promise<string> => {
  const events = await getReportEvents(
    reportId,
    encounterId,
    playerId,
    targetId,
  );

  const processor = ThreatProcessorFactory.getProcessor(
    'Rogue',
    events as WCLEvent[],
  );

  processor.processLog();

  return JSON.stringify(events);
};

interface GetReportParams {
  code: string;
}

const getReport = async (
  _: never,
  { code }: GetReportParams,
): Promise<Report> => {
  const reportData = await getReportData(code);

  const players = reportData.report.masterData.actors.map(x => {
    return {
      id: x.id,
      name: x.name,
      type: x.type,
    };
  });

  return {
    title: reportData.report.title,
    encounters: reportData.report.fights.map(x => {
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

export const reportResolver = {
  Query: {
    playerEvents: getPlayerEvents,
    playerThreatEvents: getPlayerThreatEvents,
    report: getReport,
    token: async () => {
      return await getWarcraftLogsAccessToken();
    },
  },
};
