export interface IEmailPort {
  sendConfirmationEmail(email: string, nome: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, nome: string, token: string): Promise<void>;
}
