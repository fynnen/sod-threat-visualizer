import { PlayerClass } from '../classes/playerClass';
import { AggregatedThreatEvent, ThreatEvent } from '../types/types';
import { WCLEvent, WCLFight } from '../types/WarcraftLogs/types';

export class ThreatProcessor {
  private playerClass: PlayerClass;
  private events: WCLEvent[];
  private fight: WCLFight;

  constructor(events: WCLEvent[], playerClass: PlayerClass, fight: WCLFight) {
    this.events = events;
    this.playerClass = playerClass;
    this.fight = fight;
  }

  processLog(): ThreatEvent[] {
    let totalThreat = 0;
    const threatEvents: ThreatEvent[] = [
      { threat: 0, totalThreat: 0, timestamp: this.fight.startTime },
    ];

    this.events
      .filter(x => x.sourceID === this.playerClass.getPlayerId())
      .forEach(x => {
        this.playerClass.updateBuffStatus(x);
        const generatedThreat = this.playerClass.calculateThreat(x);
        if (generatedThreat > 0) {
          totalThreat += generatedThreat;
          threatEvents.push({
            timestamp: x.timestamp,
            threat: generatedThreat,
            totalThreat: totalThreat,
          });
        }
      });

    return threatEvents;
  }
}

export class ThreatAggregator {
  static aggregateThreatBySecond(
    startTime: number,
    events: ThreatEvent[],
  ): AggregatedThreatEvent[] {
    const aggregated: { [key: number]: number } = {
      0: 0,
    };

    let totalThreat = 0;

    events.forEach(event => {
      const second = Math.floor((event.timestamp - startTime) / 1000) + 1;

      if (!aggregated[second]) {
        aggregated[second] = totalThreat;
      }
      totalThreat += event.threat;
      aggregated[second] = totalThreat;
    });

    return Object.keys(aggregated).map(second => ({
      second: Number(second),
      totalThreat: aggregated[second],
    }));
  }
}
