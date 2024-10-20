export const reportTypeDefs = `#graphql

  type EnemyNpc {
    id: Int!
    name: String!
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

  type ReportSummary {
    title: String!
    encounters: [Encounter]!
  }

  type AggregatedThreatEvent {
    second: Int
    totalThreat: Float
  }

  type Query {
    reportSummary(code: String!): ReportSummary
    playerThreatEvents(reportId: String!, playerId: Int!, encounterId: Int!, targetId: Int!): [AggregatedThreatEvent!]!
    token: String!
  }
`;
