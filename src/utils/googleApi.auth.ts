import { google } from "googleapis";

export const driveConfig = () => {

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

const oauth2Client = new google.auth.OAuth2(
  driveClientId,
  driveClientSecret,
  driveRedirectUri
);



oauth2Client.setCredentials({ refresh_token: driveRefreshToken });

return   google.drive({
version: 'v3',
auth: oauth2Client,
})
}