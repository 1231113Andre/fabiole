import { getCurrentYear } from '../../utils/date';

// GitHub-style: compact, white bg, simple typography
const STYLES = {
  body: 'margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; background-color: #f6f8fa; color: #24292f; font-size: 14px; line-height: 1.5;',
  wrapper: 'max-width: 600px; margin: 0 auto; padding: 24px 16px;',
  container: 'background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; padding: 24px 32px;',
  header: 'margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #24292f;',
  h2: 'margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #24292f;',
  p: 'margin: 0 0 16px 0; color: #57606a;',
  pLast: 'margin: 0 0 20px 0; color: #57606a;',
  box: 'background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0; font-size: 13px; color: #57606a;',
  warning: 'margin: 16px 0; padding: 12px; background: #fff8c5; border: 1px solid #9e6a03; border-radius: 6px; font-size: 13px; color: #57606a;',
  button: 'display: inline-block; background: #0969da; color: #ffffff !important; text-decoration: none; padding: 6px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;',
  footer: 'margin-top: 24px; padding-top: 16px; border-top: 1px solid #d0d7de; font-size: 12px; color: #57606a;',
};

interface ManualAccountEmailProps {
  firstName: string;
  email: string;
  isAdmin: boolean;
  resetUrl: string;
}

export function renderManualAccountEmail({ firstName, email, isAdmin, resetUrl }: ManualAccountEmailProps): string {
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
          <h2 style="${STYLES.h2}">Conta criada</h2>
          <p style="${STYLES.p}">Olá ${firstName},</p>
          <p style="${STYLES.p}">A sua conta foi criada manualmente pela administração. Receberá em breve um email separado com um código de verificação para definir a sua password.</p>
          ${isAdmin ? '<p style="margin: 0 0 16px 0; font-size: 14px; color: #cf222e; font-weight: 500;">Esta é uma conta de administrador. Tem acesso total à gestão de utilizadores e configurações.</p>' : ''}
          <div style="${STYLES.box}">
            <p style="margin: 0 0 8px 0;"><strong style="color: #24292f;">Email:</strong> ${email}</p>
            <p style="margin: 0;">Para definir a password: aceda à plataforma, clique em "Iniciar sessão" → "Recuperar Password", introduza o seu email e o código recebido.</p>
          </div>
          <p style="${STYLES.warning}">Segurança: nunca partilhe o código de verificação. A Fabiole nunca pedirá a sua password por email.</p>
          <p style="${STYLES.pLast}">
            <a href="${resetUrl}" style="${STYLES.button}">Aceder à plataforma</a>
          </p>
          <p style="${STYLES.footer}">© ${getCurrentYear()} Fabiole. Todos os direitos reservados.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
