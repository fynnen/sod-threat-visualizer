export const reportTypeDefs = `#graphql

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

  type ThreatEvent {
    threat: Float
  }

  type Query {
    report(code: String!): Report
    playerEvents(reportId: String!, playerId: Int!, encounterId: Int!, targetId: Int!): String
    playerThreatEvents(reportId: String!, playerId: Int!, encounterId: Int!, targetId: Int!): [ThreatEvent!]!
    token: String!
  }
`;
