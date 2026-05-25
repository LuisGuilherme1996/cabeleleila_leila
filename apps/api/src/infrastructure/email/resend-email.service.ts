import { env } from '../../config/env.js';
import type { IEmailPort } from '../../application/ports/email.port.js';
import { Resend } from 'resend';

export class ResendEmailService implements IEmailPort {
  private readonly resend: Resend | null = null;
  private readonly fromEmail = env.FROM_EMAIL ? `Cabeleleila Leila <${env.FROM_EMAIL}>` : 'Cabeleleila Leila <onboarding@resend.dev>';

  constructor() {
    if (env.RESEND_ID) {
      this.resend = new Resend(env.RESEND_ID);
    }
  }

  async sendConfirmationEmail(email: string, nome: string, token: string): Promise<void> {
    const confirmationUrl = `http://localhost:3000/api/auth/confirm-email?token=${token}`;
    const html = this.getConfirmationTemplate(nome, confirmationUrl);

    await this.send(email, 'Confirme seu e-mail ✨ Cabeleleila Leila', html);
  }

  async sendPasswordResetEmail(email: string, nome: string, token: string): Promise<void> {
    const html = this.getResetPasswordTemplate(nome, token);

    await this.send(email, 'Recupere sua senha 🔐 Cabeleleila Leila', html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      return;
    }

    try {
      console.log(`[EmailService] Enviando e-mail para ${to} via Resend... ${this.fromEmail}`);
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (response.error) {
        console.error('[EmailService] Erro ao enviar e-mail via Resend:', response.error);
      } else {
        console.log(`[EmailService] E-mail enviado com sucesso para ${to}. ID:`, response.data?.id);
      }
    } catch (error) {
      console.error('[EmailService] Erro na requisição para Resend:', error);
    }
  }

  private getConfirmationTemplate(nome: string, url: string): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirme seu e-mail — Cabeleleila Leila</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0d0e12;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #151720;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid #272a37;
        }
        .header {
          background: linear-gradient(135deg, #c084fc 0%, #db2777 50%, #7c3aed 100%);
          padding: 50px 40px;
          text-align: center;
          position: relative;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 500;
        }
        .content {
          padding: 40px;
          line-height: 1.6;
        }
        .greeting {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .text {
          font-size: 15px;
          color: #94a3b8;
          margin-bottom: 30px;
        }
        .btn-container {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(90deg, #c084fc 0%, #db2777 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 16px 36px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 50px;
          box-shadow: 0 8px 24px rgba(219, 39, 119, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .footer {
          background-color: #0f111a;
          padding: 30px 40px;
          text-align: center;
          border-top: 1px solid #272a37;
        }
        .footer-logo {
          font-weight: 800;
          font-size: 14px;
          background: linear-gradient(90deg, #c084fc 0%, #db2777 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .footer-tagline {
          font-size: 12px;
          color: #64748b;
          margin: 5px 0;
        }
        .footer-copy {
          font-size: 11px;
          color: #475569;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Cabeleleila Leila</h1>
          <p>Cabelos, unhas, de tudo um pouco! ✨</p>
        </div>
        <div class="content">
          <h2 class="greeting">Olá, ${nome}!</h2>
          <p class="text">
            Seja muito bem-vindo(a) ao salão de beleza mais sofisticado da região! Ficamos imensamente felizes com o seu cadastro em nosso sistema de agendamento online.
          </p>
          <p class="text">
            Para ativar a sua conta e começar a agendar os seus horários com nossos profissionais renomados, clique no botão brilhante abaixo para confirmar seu endereço de e-mail:
          </p>
          <div class="btn-container">
            <a href="${url}" class="btn" target="_blank">Confirmar Meu E-mail</a>
          </div>
          <p class="text" style="font-size: 13px; color: #475569;">
            Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:<br>
            <a href="${url}" style="color: #c084fc; text-decoration: underline;">${url}</a>
          </p>
        </div>
        <div class="footer">
          <div class="footer-logo">CABELELEILA LEILA</div>
          <div class="footer-tagline">Rua da Beleza, 123 • Centro • Tel: (11) 99999-9999</div>
          <div class="footer-tagline">Garantindo que você, seu cabelo e sua unha fiquem espetaculares!</div>
          <div class="footer-copy">© 2026 Cabeleleila Leila S.A. Todos os direitos reservados.</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private getResetPasswordTemplate(nome: string, code: string): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha — Cabeleleila Leila</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0d0e12;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #151720;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid #272a37;
        }
        .header {
          background: linear-gradient(135deg, #f43f5e 0%, #db2777 50%, #9333ea 100%);
          padding: 50px 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 500;
        }
        .content {
          padding: 40px;
          line-height: 1.6;
        }
        .greeting {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .text {
          font-size: 15px;
          color: #94a3b8;
          margin-bottom: 30px;
        }
        .footer {
          background-color: #0f111a;
          padding: 30px 40px;
          text-align: center;
          border-top: 1px solid #272a37;
        }
        .footer-logo {
          font-weight: 800;
          font-size: 14px;
          background: linear-gradient(90deg, #f43f5e 0%, #db2777 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .footer-tagline {
          font-size: 12px;
          color: #64748b;
          margin: 5px 0;
        }
        .footer-copy {
          font-size: 11px;
          color: #475569;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recuperação de Senha</h1>
          <p>Cabeleleila Leila • Cabelos, unhas, de tudo um pouco! 🔐</p>
        </div>
        <div class="content">
          <h2 class="greeting">Olá, ${nome}!</h2>
          <p class="text">
            Recebemos uma solicitação de redefinição de senha para a sua conta em nosso portal de agendamento online. Se não foi você quem solicitou, pode ignorar este e-mail tranquilamente.
          </p>
          <p class="text">
            Use o código de verificação de 6 dígitos abaixo para redefinir a sua senha no portal:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #272a37; border: 1px solid #f43f5e; color: #ffffff; font-size: 32px; font-weight: 800; padding: 12px 30px; letter-spacing: 5px; border-radius: 10px; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);">
              ${code}
            </span>
          </div>
          <p class="text" style="font-size: 13px; color: #475569; text-align: center;">
            Por motivos de segurança, este código é válido por apenas 15 minutos.
          </p>
        </div>
        <div class="footer">
          <div class="footer-logo">CABELELEILA LEILA</div>
          <div class="footer-tagline">Rua da Beleza, 123 • Centro • Tel: (11) 99999-9999</div>
          <div class="footer-tagline">Transformando visual com carinho, elegância e dedicação!</div>
          <div class="footer-copy">© 2026 Cabeleleila Leila S.A. Todos os direitos reservados.</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
