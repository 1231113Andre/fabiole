import { getCurrentYear } from '../../utils/date';

// GitHub-style: compact, white bg, simple typography
const STYLES = {
  body: 'margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; background-color: #f6f8fa; color: #24292f; font-size: 14px; line-height: 1.5;',
  wrapper: 'max-width: 600px; margin: 0 auto; padding: 24px 16px;',
  container: 'background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; padding: 24px 32px;',
  header: 'margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #24292f;',
  h2: 'margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #24292f;',
  p: 'margin: 0 0 16px 0; color: #57606a;',
  box: 'background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0; font-size: 13px; color: #57606a;',
  link: 'color: #0969da; text-decoration: none;',
  footer: 'margin-top: 24px; padding-top: 16px; border-top: 1px solid #d0d7de; font-size: 12px; color: #57606a;',
};

interface AccountStatusChangeEmailProps {
  firstName: string;
  userEmail: string;
  newStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  adminEmail: string;
  changedAt: string;
  reason?: string;
}

export function renderAccountStatusChangeEmail({
  firstName,
  userEmail,
  newStatus,
  adminEmail,
  changedAt,
  reason
}: AccountStatusChangeEmailProps): string {
  const isSuspended = newStatus === 'SUSPENDED';
  const isBanned = newStatus === 'BANNED';
  const isActive = newStatus === 'ACTIVE';

  let statusTitle = '';
  let statusLabel = '';
  let statusDescription = '';

  if (isActive) {
    statusTitle = 'Conta reativada';
    statusLabel = 'Ativo';
    statusDescription = 'A sua conta foi reativada. O acesso à plataforma foi restaurado.';
  } else if (isSuspended) {
    statusTitle = 'Conta suspensa';
    statusLabel = 'Suspenso';
    statusDescription = 'A sua conta foi temporariamente suspensa. O acesso está revogado até nova decisão da administração.';
  } else {
    statusTitle = 'Conta banida';
    statusLabel = 'Banido';
    statusDescription = 'A sua conta foi permanentemente banida. Não será possível aceder à plataforma com esta conta.';
  }

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
          <h2 style="${STYLES.h2}">${statusTitle}</h2>
          <p style="${STYLES.p}">Olá ${firstName},</p>
          <p style="${STYLES.p}">${statusDescription}</p>
          <div style="${STYLES.box}">
            <p style="margin: 0 0 8px 0;"><strong style="color: #24292f;">Conta:</strong> ${userEmail}</p>
            <p style="margin: 0 0 8px 0;"><strong style="color: #24292f;">Estado:</strong> ${statusLabel}</p>
            <p style="margin: 0 0 8px 0;"><strong style="color: #24292f;">Alterado por:</strong> ${adminEmail}</p>
            <p style="margin: 0 0 8px 0;"><strong style="color: #24292f;">Data:</strong> ${changedAt}</p>
            ${isBanned && reason ? `<p style="margin: 8px 0 0 0;"><strong style="color: #24292f;">Motivo:</strong> ${reason}</p>` : ''}
          </div>
          <p style="${STYLES.p}">Se acredita que esta ação foi tomada por engano, contacte a administração: <a href="mailto:${adminEmail}" style="${STYLES.link}">${adminEmail}</a></p>
          <p style="${STYLES.footer}">© ${getCurrentYear()} Fabiole. Todos os direitos reservados.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
