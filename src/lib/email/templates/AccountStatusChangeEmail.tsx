import { getCurrentYear } from '../../utils/date';

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
    let statusColor = '';
    let statusIcon = '';
    let statusDescription = '';

    if (isActive) {
        statusTitle = 'Conta Reativada';
        statusColor = '#10b981'; // emerald-500
        statusIcon = '✅';
        statusDescription = 'Boas notícias! A sua conta foi reativada. O acesso à plataforma foi restaurado e já pode voltar a utilizá-la normalmente.';
    } else if (isSuspended) {
        statusTitle = 'Conta Suspensa';
        statusColor = '#f59e0b'; // amber-500
        statusIcon = '⏸️';
        statusDescription = 'A sua conta foi temporariamente suspensa. O acesso à plataforma está revogado até nova decisão da administração.';
    } else { // isBanned
        statusTitle = 'Conta Banida';
        statusColor = '#ef4444'; // red-500
        statusIcon = '🚫';
        statusDescription = 'A sua conta foi permanentemente banida. Não será possível aceder à plataforma com esta conta.';
    }

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
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">${statusIcon}</span>
          </div>
          <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; color: ${statusColor};">
            ${statusTitle}
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #e0e0e0; text-align: center;">
            Olá ${firstName},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #a0a0a0; text-align: center; line-height: 1.6;">
            ${statusDescription}
          </p>
          
          <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #a0a0a0;">
              <strong>Conta afetada:</strong> <span style="color: #ffffff;">${userEmail}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #a0a0a0;">
              <strong>Novo estado:</strong> <span style="color: ${statusColor}; font-weight: bold;">${isActive ? 'ATIVO' : isSuspended ? 'SUSPENSO' : 'BANIDO'}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #a0a0a0;">
              <strong>Alterado por:</strong> <span style="color: #ffffff;">${adminEmail}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #a0a0a0;">
              <strong>Data da alteração:</strong> <span style="color: #ffffff;">${changedAt}</span>
            </p>
            ${isBanned && reason ? `
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #a0a0a0;">
                <strong style="color: #ef4444;">Motivo do Bloqueio:</strong> <span style="color: #ffffff;">${reason}</span>
            </p>
            ` : ''}
          </div>

          <p style="margin: 0 0 24px 0; font-size: 13px; color: #a0a0a0; text-align: center; background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); line-height: 1.5;">
            Se acredita que esta ação foi tomada por engano ou deseja contestar esta decisão, 
            por favor contacte a administração através do email: <br>
            <a href="mailto:${adminEmail}" style="color: #667eea; text-decoration: none; font-weight: 600;">${adminEmail}</a>
          </p>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${getCurrentYear()} Fabiole. Todos os direitos reservados.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}
