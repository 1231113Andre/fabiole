// src/lib/email/templates/VerificationCodeEmail.tsx
// Beautiful email template for verification codes - Fabiole brand style

import * as React from 'react';
import { getCurrentYear } from '../../utils/date';

type VerificationPurpose = 'registration' | 'password-reset' | 'email-change';

interface VerificationCodeEmailProps {
  code: string;
  firstName?: string;
  expiryMinutes?: number;
  purpose?: VerificationPurpose;
}

// Content based on purpose
const PURPOSE_CONTENT: Record<VerificationPurpose, {
  title: string;
  description: string;
  ctaText: string;
  disclaimer: string;
}> = {
  'registration': {
    title: 'Verification Code',
    description: 'Use the code below to complete your registration<br/>and start your fitness journey with us.',
    ctaText: 'Your Fitness Journey Starts Now!',
    disclaimer: "If you didn't request this code, you can safely ignore this email.",
  },
  'password-reset': {
    title: 'Password Reset',
    description: 'Use the code below to reset your password<br/>and regain access to your account.',
    ctaText: 'Secure Your Account',
    disclaimer: "If you didn't request a password reset, you can safely ignore this email.",
  },
  'email-change': {
    title: 'Email Verification',
    description: 'Use the code below to confirm your new email address.',
    ctaText: 'Verify Your New Email',
    disclaimer: "If you didn't request this change, you can safely ignore this email.",
  },
};

// Fabiole brand colors from globals.css
const COLORS = {
  primary: '#e6915b',       // Brand orange
  primaryHover: '#d37d45',
  accent: '#fb923c',        // Tailwind orange-400
  background: '#ffffff',
  foreground: '#171717',
  muted: '#737373',
  darkBg: '#1c2434',        // Sidebar dark
  darkBgDeep: '#0a1628',    // Sidebar deeper
  textLight: '#dee4ee',
  textMuted: '#8a99af',
};

/**
 * Render the email template to HTML string
 * Note: Logo removed due to email client limitations - using text logo instead
 */
export function renderVerificationCodeEmail(props: VerificationCodeEmailProps): string {
  const { code, firstName = 'there', expiryMinutes = 10, purpose = 'registration' } = props;
  const content = PURPOSE_CONTENT[purpose];

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${content.title} - Fabiole</title>
  <!--[if mso]>
  <style type="text/css">
    table, td, div, p { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 48px 16px;">
        
        <!-- Email container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: linear-gradient(180deg, #1c2434 0%, #0a1628 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);">
          
          <!-- Text Logo Header -->
          <tr>
            <td align="center" style="padding: 48px 48px 16px 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border: 3px solid #e6915b; border-radius: 16px; padding: 20px 32px;">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; font-style: italic; color: #e6915b; letter-spacing: 2px; text-transform: uppercase;">
                      FÁBIO LÉ
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 10px; font-weight: 600; color: #fb923c; letter-spacing: 4px; text-transform: uppercase;">
                      PERSONAL TRAINER
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td align="center" style="padding: 24px 48px 24px 48px;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
                ${content.title}
              </h2>
              <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #e6915b, #fb923c); margin: 16px auto 0 auto; border-radius: 2px;"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding: 0 48px 16px 48px;">
              <p style="margin: 0; font-size: 18px; color: #dee4ee; line-height: 1.5;">
                Hey <span style="color: #e6915b; font-weight: 600;">${firstName}</span>!
              </p>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td align="center" style="padding: 0 48px 32px 48px;">
              <p style="margin: 0; font-size: 15px; color: #8a99af; line-height: 1.7;">
                ${content.description}
              </p>
            </td>
          </tr>

          <!-- Code Box -->
          <tr>
            <td align="center" style="padding: 0 48px 32px 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e6915b 0%, #d37d45 100%); border-radius: 12px; padding: 3px;">
                <tr>
                  <td style="background: #0a1628; border-radius: 10px; padding: 18px 28px;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; color: #ffffff; display: block; text-align: center;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry Warning -->
          <tr>
            <td align="center" style="padding: 0 48px 24px 48px;">
              <p style="margin: 0; font-size: 14px; color: #fb923c; font-weight: 600; line-height: 1.5;">
                This code expires in <strong>${expiryMinutes} minutes</strong>
              </p>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td align="center" style="padding: 0 48px 40px 48px;">
              <p style="margin: 0; font-size: 13px; color: #8a99af; line-height: 1.6;">
                ${content.disclaimer}
              </p>
            </td>
          </tr>

          <!-- CTA Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #e6915b 0%, #d37d45 100%); padding: 20px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                      ${content.ctaText}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0a1628; padding: 32px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #8a99af; font-weight: 500;">
                      Fábio Lé — Personal Trainer
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      Transform your life. One workout at a time.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>

        <!-- Copyright outside card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding: 24px 16px 0 16px;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                © ${getCurrentYear()} Fabiole. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

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
}: VerificationCodeEmailProps): React.ReactElement {
  return (
    <html lang="pt">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Código de Verificação - Fabiole</title>
      </head>
      <body style={styles.body}>
        <table style={styles.wrapper}>
          <tbody>
            <tr>
              <td style={styles.container}>
                <table style={styles.card}>
                  <tbody>
                    <tr>
                      <td style={styles.logoCell}>
                        <table style={styles.logoBorder}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: 'center' as const }}>
                                <h1 style={styles.logoText}>FÁBIO LÉ</h1>
                                <p style={styles.logoSubtext}>PERSONAL TRAINER</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.titleCell}>
                        <h2 style={styles.title}>Verification Code</h2>
                        <div style={styles.divider} />
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.greetingCell}>
                        <p style={styles.greeting}>
                          Hey <span style={styles.name}>{firstName}</span>! 💪
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.descCell}>
                        <p style={styles.desc}>
                          Use the code below to complete your registration<br />and start your fitness journey with us.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.codeCell}>
                        <table style={styles.codeOuter}>
                          <tbody>
                            <tr>
                              <td style={styles.codeInner}>
                                <span style={styles.code}>{code}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.expiryCell}>
                        <p style={styles.expiry}>
                          ⏱️ This code expires in <strong>{expiryMinutes} minutes</strong>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// Styles for React component
const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  wrapper: {
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: '48px 16px',
    textAlign: 'center' as const,
  },
  card: {
    maxWidth: 560,
    margin: '0 auto',
    background: `linear-gradient(180deg, ${COLORS.darkBg} 0%, ${COLORS.darkBgDeep} 100%)`,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
  },
  logoCell: {
    padding: '48px 48px 16px 48px',
    textAlign: 'center' as const,
  },
  logoBorder: {
    display: 'inline-block',
    border: `3px solid ${COLORS.primary}`,
    borderRadius: 16,
    padding: '20px 32px',
  },
  logoText: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    fontStyle: 'italic',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  logoSubtext: {
    margin: '6px 0 0 0',
    fontSize: 10,
    fontWeight: 600,
    color: COLORS.accent,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
  },
  titleCell: {
    padding: '24px 48px 24px 48px',
    textAlign: 'center' as const,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
  },
  divider: {
    width: 60,
    height: 3,
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
    margin: '16px auto 0 auto',
    borderRadius: 2,
  },
  greetingCell: {
    padding: '0 48px 16px 48px',
    textAlign: 'center' as const,
  },
  greeting: {
    margin: 0,
    fontSize: 18,
    color: COLORS.textLight,
    lineHeight: 1.5,
  },
  name: {
    color: COLORS.primary,
    fontWeight: 600,
  },
  descCell: {
    padding: '0 48px 32px 48px',
    textAlign: 'center' as const,
  },
  desc: {
    margin: 0,
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 1.7,
  },
  codeCell: {
    padding: '0 48px 32px 48px',
    textAlign: 'center' as const,
  },
  codeOuter: {
    display: 'inline-block',
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
    borderRadius: 16,
    padding: 4,
  },
  codeInner: {
    background: COLORS.darkBgDeep,
    borderRadius: 14,
    padding: '28px 40px',
  },
  code: {
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: 16,
    fontFamily: "'Courier New', Courier, monospace",
    color: '#ffffff',
    display: 'block',
    textAlign: 'center' as const,
  },
  expiryCell: {
    padding: '0 48px 24px 48px',
    textAlign: 'center' as const,
  },
  expiry: {
    margin: 0,
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: 600,
    lineHeight: 1.5,
  },
};
