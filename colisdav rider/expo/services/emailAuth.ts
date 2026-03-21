export interface AuthCode {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

class EmailAuthService {
  private authCodes: Map<string, AuthCode> = new Map();
  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  // Generate a random 6-digit code
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send authentication code to email (simulated)
  async sendAuthCode(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Standardize email to lowercase for storage
      const searchEmail = email.toLowerCase().trim();

      // Generate new code
      const code = this.generateCode();
      const expiresAt = new Date(
        Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000,
      );

      // Store the code
      this.authCodes.set(searchEmail, {
        code,
        email: searchEmail,
        expiresAt,
        attempts: 0,
      });

      // In a real app, this would send an email via an email service
      // For now, we'll simulate it and log to console
      console.log(`📧 AUTH CODE for ${searchEmail}: ${code}`);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: `Authentication code sent to ${email}`,
      };
    } catch (error) {
      console.error("Error sending auth code:", error);
      return {
        success: false,
        message: "Failed to send authentication code",
      };
    }
  }

  // Verify authentication code
  async verifyAuthCode(
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string }> {
    // Standardize email to lowercase for lookup
    const searchEmail = email.toLowerCase().trim();
    const authCode = this.authCodes.get(searchEmail);

    console.log(`Verifying code for ${searchEmail}. Found code:`, !!authCode);

    if (!authCode) {
      return {
        success: false,
        message:
          "No authentication code found for this email. Please request a new one.",
      };
    }

    // Check if code has expired
    if (new Date() > authCode.expiresAt) {
      this.authCodes.delete(email);
      return {
        success: false,
        message: "Authentication code has expired",
      };
    }

    // Check if max attempts reached
    if (authCode.attempts >= this.MAX_ATTEMPTS) {
      this.authCodes.delete(email);
      return {
        success: false,
        message: "Maximum attempts reached. Please request a new code.",
      };
    }

    // Check if code matches
    if (authCode.code !== code) {
      authCode.attempts++;
      const remainingAttempts = this.MAX_ATTEMPTS - authCode.attempts;

      return {
        success: false,
        message: `Invalid code. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Code is valid - remove it from storage
    this.authCodes.delete(email);

    return {
      success: true,
      message: "Authentication successful!",
    };
  }

  // For development only: get current code for email
  getCurrentCode(email: string): string | null {
    const searchEmail = email.toLowerCase().trim();
    const authCode = this.authCodes.get(searchEmail);
    return authCode ? authCode.code : null;
  }

  // Clean up expired codes
  cleanupExpiredCodes() {
    const now = new Date();
    for (const [email, authCode] of this.authCodes.entries()) {
      if (now > authCode.expiresAt) {
        this.authCodes.delete(email);
      }
    }
  }

  // Simulate email sending (for development)
  simulateEmailSending(email: string, code: string): void {
    console.log(`
    ═══════════════════════════════════════════════════════════════
    📧 EMAIL AUTHENTICATION CODE
    ═══════════════════════════════════════════════════════════════
    To: ${email}
    Subject: Your COLISDAV Authentication Code
    
    Your authentication code is: ${code}
    
    This code will expire in ${this.CODE_EXPIRY_MINUTES} minutes.
    
    If you didn't request this code, please ignore this email.
    ═══════════════════════════════════════════════════════════════
    `);
  }
}

export const emailAuthService = new EmailAuthService();
