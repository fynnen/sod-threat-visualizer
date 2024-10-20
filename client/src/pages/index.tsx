import { LineChart } from "@/components/LineChart";
import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

const DETAIL_QUERY = gql`
  query PlayerThreatEvents(
    $reportId: String!
    $playerId: Int!
    $encounterId: Int!
    $targetId: Int!
  ) {
    playerThreatEvents(
      reportId: $reportId
      playerId: $playerId
      encounterId: $encounterId
      targetId: $targetId
    ) {
      second
      totalThreat
    }
  }
`;

function ReportDetail({
  reportCode,
  encounterId,
  targetId,
  player,
}: {
  reportCode: string;
  player: any;
  encounterId: number;
  targetId: number;
}) {
  const { loading, error, data } = useQuery(DETAIL_QUERY, {
    variables: {
      reportId: reportCode,
      encounterId,
      targetId,
      playerId: player.id,
    },
  });

  if (loading) return <h2>"Loading..."</h2>;

  if (error) return <p>`Error! ${error.message}`</p>;

  const chartData = {
    labels: data.playerThreatEvents.map((x: any) => x.second),
    datasets: [
      {
        label: player.name,
        data: data.playerThreatEvents.map((x: any) => x.totalThreat),
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <LineChart chartData={chartData} />
    </>
  );
}

const SUMMARY_QUERY = gql`
  query ReportQuery($code: String!) {
    reportSummary(code: $code) {
      title
      encounters {
        id
        name
        zone
        players {
          id
          name
        }
        enemies {
          id
          name
        }
      }
    }
  }
`;

type Player = {
  id: number;
  name: string;
};
function Report({ reportCode }: { reportCode: string }) {
  const [encounterId, setEncounterId] = useState(0);
  const [targetId, setTargetId] = useState(0);
  const [player, setPlayer] = useState<Player | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  const { loading, error, data } = useQuery(SUMMARY_QUERY, {
    variables: { code: reportCode },
  });

  if (loading) return <h2>"Loading..."</h2>;

  if (error) return <p>`Error! ${error.message}`</p>;

  const currentEncounter = data?.reportSummary?.encounters.find(
    (x: any) => x.id === encounterId
  );

  return (
    <>
      <h2>Log: {data.reportSummary.title}</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Select an encounter
          </label>
          <select
            id="countries"
            defaultValue={"0"}
            onChange={(e) => {
              setShowGraph(false);
              setEncounterId(parseInt(e.target.value, 10));
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="0">Choose an encounter</option>
            {data?.reportSummary?.encounters &&
              data?.reportSummary?.encounters.map((x: any) => {
                return <option value={x.id}>{x.name}</option>;
              })}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Select a target
          </label>
          <select
            id="countries"
            defaultValue={"0"}
            onChange={(e) => {
              setShowGraph(false);
              setTargetId(parseInt(e.target.value, 10));
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="0">Choose a target</option>
            {currentEncounter &&
              currentEncounter.enemies.map((x: any) => {
                return <option value={x.id}>{x.name}</option>;
              })}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Select a player
          </label>
          <select
            id="countries"
            defaultValue={"0"}
            onChange={(e) => {
              setShowGraph(false);
              setPlayer(
                currentEncounter.players.find(
                  (x: any) => x.id === parseInt(e.target.value, 10)
                )
              );
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="0">Choose a player</option>
            {currentEncounter &&
              currentEncounter.players.map((x: any) => {
                return <option value={x.id}>{x.name}</option>;
              })}
          </select>
        </div>
      </div>
      <button
        type="button"
        disabled={encounterId === 0 || targetId === 0 || player?.id === 0}
        onClick={() => setShowGraph(true)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Analyze
      </button>
      {showGraph && (
        <ReportDetail
          encounterId={encounterId}
          targetId={targetId}
          player={player}
          reportCode={reportCode}
        />
      )}
    </>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [reportCode, setReportCode] = useState("");

  const onFetch = () => {
    setReportCode("");
    const regex =
      /(https:\/\/(vanilla|sod|classic|wwww).warcraftlogs.com\/reports\/)(\w*)(#.*)?/gm;
    const groups = regex.exec(url);
    setReportCode(groups ? groups[3] : "");
  };

  return (
    <div>
      <p className="mb-4">
        Lets you import a warcraftlog report and analyze the threat done by
        players for a specific encounter.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Warcraftlog URL
          </label>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="search"
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="https://sod.warcraftlogs.com"
                required
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                type="submit"
                onClick={onFetch}
                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Fetch
              </button>
            </div>
            <p
              id="helper-text-explanation"
              className="mt-2 text-sm text-gray-500 dark:text-gray-400"
            >
              You can either input the full URL or just the report code
            </p>
          </div>
        </div>
        {reportCode && <Report reportCode={reportCode} />}
      </div>
    </div>
  );
}
