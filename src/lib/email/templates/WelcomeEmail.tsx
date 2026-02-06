import { getCurrentYear } from '../../utils/date';

// GitHub-style: compact, white bg, simple typography, no gradients
const STYLES = {
  body: 'margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; background-color: #f6f8fa; color: #24292f; font-size: 14px; line-height: 1.5;',
  wrapper: 'max-width: 600px; margin: 0 auto; padding: 24px 16px;',
  container: 'background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; padding: 24px 32px;',
  header: 'margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #24292f;',
  h2: 'margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #24292f;',
  p: 'margin: 0 0 16px 0; color: #57606a;',
  pLast: 'margin: 0 0 20px 0; color: #57606a;',
  button: 'display: inline-block; background: #0969da; color: #ffffff !important; text-decoration: none; padding: 6px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;',
  footer: 'margin-top: 24px; padding-top: 16px; border-top: 1px solid #d0d7de; font-size: 12px; color: #57606a;',
};

export function renderWelcomeEmail(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${STYLES.body}">
  <table width="100%" cellpadding="0" cellspacing="0" style="${STYLES.wrapper}">
    <tr>
      <td>
        <div style="${STYLES.container}">
          <p style="${STYLES.header}">Fabiole</p>
          <h2 style="${STYLES.h2}">Welcome, ${firstName}</h2>
          <p style="${STYLES.p}">Your account has been created successfully. You're now ready to start your fitness journey with personalized coaching.</p>
          <p style="${STYLES.pLast}">
            <a href="https://fabiole.com/dashboard" style="${STYLES.button}">Go to Dashboard</a>
          </p>
          <p style="${STYLES.footer}">© ${getCurrentYear()} Fabiole. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
