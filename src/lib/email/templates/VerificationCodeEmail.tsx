// GitHub-style: compact, white bg, simple typography

import * as React from 'react';
import { getCurrentYear } from '../../utils/date';

type VerificationPurpose = 'registration' | 'password-reset' | 'email-change';

interface VerificationCodeEmailProps {
  code: string;
  firstName?: string;
  expiryMinutes?: number;
  purpose?: VerificationPurpose;
}

const PURPOSE_CONTENT: Record<VerificationPurpose, {
  title: string;
  description: string;
  disclaimer: string;
}> = {
  'registration': {
    title: 'Verification code',
    description: 'Use the code below to complete your registration and start your fitness journey.',
    disclaimer: "If you didn't request this code, you can safely ignore this email.",
  },
  'password-reset': {
    title: 'Password reset',
    description: 'Use the code below to reset your password and regain access to your account.',
    disclaimer: "If you didn't request a password reset, you can safely ignore this email.",
  },
  'email-change': {
    title: 'Email verification',
    description: 'Use the code below to confirm your new email address.',
    disclaimer: "If you didn't request this change, you can safely ignore this email.",
  },
};

// GitHub-style inline styles
const STYLES = {
  body: 'margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; background-color: #f6f8fa; color: #24292f; font-size: 14px; line-height: 1.5;',
  wrapper: 'max-width: 600px; margin: 0 auto; padding: 24px 16px;',
  container: 'background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; padding: 24px 32px;',
  header: 'margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #24292f;',
  h2: 'margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #24292f;',
  p: 'margin: 0 0 16px 0; color: #57606a;',
  codeBox: 'background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 16px 24px; margin: 16px 0; font-size: 24px; font-weight: 600; letter-spacing: 4px; font-family: ui-monospace, monospace; color: #24292f; text-align: center;',
  expiry: 'margin: 0 0 16px 0; font-size: 13px; color: #57606a;',
  disclaimer: 'margin: 0; font-size: 12px; color: #57606a;',
  footer: 'margin-top: 24px; padding-top: 16px; border-top: 1px solid #d0d7de; font-size: 12px; color: #57606a;',
};

export function renderVerificationCodeEmail(props: VerificationCodeEmailProps): string {
  const { code, firstName = 'there', expiryMinutes = 10, purpose = 'registration' } = props;
  const content = PURPOSE_CONTENT[purpose];

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title} - Fabiole</title>
</head>
<body style="${STYLES.body}">
  <table width="100%" cellpadding="0" cellspacing="0" style="${STYLES.wrapper}">
    <tr>
      <td>
        <div style="${STYLES.container}">
          <p style="${STYLES.header}">Fabiole</p>
          <h2 style="${STYLES.h2}">${content.title}</h2>
          <p style="${STYLES.p}">Hi ${firstName},</p>
          <p style="${STYLES.p}">${content.description.replace('<br/>', ' ').replace('<br>', ' ')}</p>
          <div style="${STYLES.codeBox}">${code}</div>
          <p style="${STYLES.expiry}">This code expires in ${expiryMinutes} minutes.</p>
          <p style="${STYLES.disclaimer}">${content.disclaimer}</p>
          <p style="${STYLES.footer}">© ${getCurrentYear()} Fabiole. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * React component version (for future use with @react-email)
 */
export function VerificationCodeEmail({
  code,
  firstName = 'there',
  expiryMinutes = 10,
  purpose = 'registration',
}: VerificationCodeEmailProps): React.ReactElement {
  const content = PURPOSE_CONTENT[purpose];
  return (
    <html lang="pt">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{content.title} - Fabiole</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', backgroundColor: '#f6f8fa', color: '#24292f', fontSize: 14, lineHeight: 1.5 }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
          <tr>
            <td>
              <div style={{ background: '#ffffff', border: '1px solid #d0d7de', borderRadius: 6, padding: '24px 32px' }}>
                <p style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600, color: '#24292f' }}>Fabiole</p>
                <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#24292f' }}>{content.title}</h2>
                <p style={{ margin: '0 0 16px 0', color: '#57606a' }}>Hi {firstName},</p>
                <p style={{ margin: '0 0 16px 0', color: '#57606a' }}>{content.description}</p>
                <div style={{ background: '#f6f8fa', border: '1px solid #d0d7de', borderRadius: 6, padding: '16px 24px', margin: '16px 0', fontSize: 24, fontWeight: 600, letterSpacing: 4, fontFamily: 'ui-monospace, monospace', color: '#24292f', textAlign: 'center' }}>{code}</div>
                <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#57606a' }}>This code expires in {expiryMinutes} minutes.</p>
                <p style={{ margin: 0, fontSize: 12, color: '#57606a' }}>{content.disclaimer}</p>
                <p style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #d0d7de', fontSize: 12, color: '#57606a' }}>© {getCurrentYear()} Fabiole. All rights reserved.</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
