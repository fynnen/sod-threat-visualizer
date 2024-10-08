import axios from 'axios';

export async function getWarcraftLogsAccessToken(): Promise<string> {
  const clientId = process.env.WARCRAFT_LOGS_CLIENT_ID;
  const clientSecret = process.env.WARCRAFT_LOGS_CLIENT_SECRET;

  const response = await axios.post('https://www.warcraftlogs.com/oauth/token', {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  return response.data.access_token;
}