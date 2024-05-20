import jwt from "jsonwebtoken";

// Secret key for signing tokens - this should be stored in an environment variable in a real application
const secret = process.env.JWT_SECRET || "your_secret_key";

// Function to generate a password reset token
export function generateResetToken(userId: number): string {
  // Create a token with the userId payload and an expiration time
  return jwt.sign({ userId }, secret, { expiresIn: "1h" });
}

// Function to verify a password reset token
export function verifyResetToken(token: string): number | null {
  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, secret) as { userId: number };
    // Return the userId from the token payload
    return decoded.userId;
  } catch (error) {
    // If the token is invalid or expired, return null
    return null;
  }
}
