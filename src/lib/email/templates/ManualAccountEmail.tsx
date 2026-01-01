import { getCurrentYear } from '../../utils/date';

interface ManualAccountEmailProps {
    firstName: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

export function renderManualAccountEmail({ firstName, email, password, isAdmin }: ManualAccountEmailProps): string {
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
            Conta Criada com Sucesso! 🎉
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #e0e0e0; text-align: center;">
            Olá ${firstName}!
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #a0a0a0; text-align: center; line-height: 1.6;">
            A sua conta foi criada manualmente pela administração (fabiole@fabiole.com).<br>
            ${isAdmin ? '<br><strong style="color: #ef4444;">ESTA É UMA CONTA DE ADMINISTRADOR.</strong><br>Você tem acesso total à gestão de utilizadores e configurações do sistema.<br>' : ''}
            Abaixo estão as suas credenciais de acesso:
          </p>
          
          <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #a0a0a0;">
              <strong>Email:</strong> <span style="color: #ffffff;">${email}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #a0a0a0;">
              <strong>Password:</strong> <span style="color: #ffffff; font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${password}</span>
            </p>
          </div>

          <p style="margin: 0 0 24px 0; font-size: 13px; color: #fbbf24; text-align: center; background: rgba(251, 191, 36, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.2);">
            ⚠️ <strong>Importante:</strong> Por favor, altere a sua password no primeiro acesso através da aba "Definições".
          </p>

          <div style="text-align: center;">
            <a href="https://fabiole.com/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Aceder à Plataforma
            </a>
          </div>
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
