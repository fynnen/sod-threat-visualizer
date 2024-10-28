import { PlayerClassFactory } from '../../classes/playerFactory';
import {
  ThreatAggregator,
  ThreatProcessor,
} from '../../services/threatProcessor';
import {
  getDetailedReportForPlayer,
  getReportSummary,
  getWarcraftLogsAccessToken,
} from '../../services/wclService';
import { AggregatedThreatEvent, Report, ThreatEvent } from '../../types/types';
import {
  WCLActor,
  WCLCombatantInfoEvent,
  WCLEvent,
  WCLEventType,
} from '../../types/WarcraftLogs/types';

export interface GetPlayerEventsParams {
  reportId: string;
  encounterId: number;
  playerId: number;
  targetId: number;
}

const getPlayerThreatEvents = async (
  _: never,
  { reportId, encounterId, playerId, targetId }: GetPlayerEventsParams,
): Promise<AggregatedThreatEvent[]> => {
  const detailReportForPlayer = await getDetailedReportForPlayer({
    reportId,
    encounterId,
    playerId,
    targetId,
  });

  console.log(detailReportForPlayer.fights);
  const fight = detailReportForPlayer.fights.find(x => x.id === encounterId);

  const player = detailReportForPlayer.masterData.actors.find(
    x => x.id === playerId,
  ) as WCLActor;

  const events = detailReportForPlayer.events.data as WCLEvent[];
  const combatantInfo = events.find(
    x => x.type === WCLEventType.combatantinfo,
  ) as WCLCombatantInfoEvent;
  const playerClass = PlayerClassFactory.createPlayerClass(
    player,
    combatantInfo,
  );
  const processor = new ThreatProcessor(events, playerClass, fight);

  const threatEvents = processor.processLog();

  const threatPerSecond = ThreatAggregator.aggregateThreatBySecond(
    fight.startTime,
    threatEvents,
  );

  return threatPerSecond;
};

interface GetReportParams {
  code: string;
}

const getReport = async (
  _: never,
  { code }: GetReportParams,
): Promise<Report> => {
  const report = await getReportSummary(code);

  const players = report.masterData.actors
    .filter(x => x.type === 'Player')
    .map(x => {
      return {
        id: x.id,
        name: x.name,
        type: x.type,
      };
    });

  const npc = report.masterData.actors
    .filter(x => x.type === 'NPC')
    .map(x => {
      return {
        id: x.id,
        name: x.name,
        type: x.type,
      };
    });

  return {
    title: report.title,
    encounters: report.fights.map(x => {
      return {
        id: x.id,
        name: x.name,
        zone: x.gameZone.name,
        players: x.friendlyPlayers.map(x => {
          return players.find(player => player.id === x);
        }),
        enemies: x.enemyNPCs.map(x => {
          return npc.find(npc => npc.id === x.id);
        }),
      };
    }),
  };
};

export const reportResolver = {
  Query: {
    playerThreatEvents: getPlayerThreatEvents,
    reportSummary: getReport,
    token: async () => {
      return await getWarcraftLogsAccessToken();
    },
  },
};
