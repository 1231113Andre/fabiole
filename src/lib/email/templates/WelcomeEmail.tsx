import { getCurrentYear } from '../../utils/date';

export function renderWelcomeEmail(firstName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #667eea;">
            Fabiole
          </h1>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; color: #ffffff;">
            Welcome to Fabiole! 🎉
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #e0e0e0; text-align: center;">
            Hey ${firstName}!
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #a0a0a0; text-align: center;">
            Your account has been created successfully. You're now ready to start your fitness journey with personalized coaching.
          </p>
          <div style="text-align: center;">
            <a href="https://fabiole.com/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${getCurrentYear()} Fabiole. All rights reserved.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}
