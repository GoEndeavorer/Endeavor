import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, verification, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { scrypt as scryptCb, randomBytes } from "crypto";

// Match Better Auth's scrypt config: N=16384, r=16, p=1, dkLen=64
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scryptCb(
      Buffer.from(password.normalize("NFKC")),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, key) => {
        if (err) return reject(err);
        resolve(`${salt}:${key.toString("hex")}`);
      }
    );
  });
}

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Find verification token matching password-reset prefix
  const [verif] = await db
    .select()
    .from(verification)
    .where(eq(verification.value, token))
    .limit(1);

  if (!verif || !verif.identifier.startsWith("password-reset:")) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  if (new Date() > verif.expiresAt) {
    await db.delete(verification).where(eq(verification.id, verif.id));
    return NextResponse.json(
      { error: "Reset link has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const email = verif.identifier.replace("password-reset:", "");

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!existingUser) {
    return NextResponse.json(
      { error: "Invalid reset link" },
      { status: 400 }
    );
  }

  // Hash the new password using the same scrypt config as Better Auth
  const hashedPassword = await hashPassword(password);

  // Update the password in the account table
  await db
    .update(account)
    .set({ password: hashedPassword })
    .where(
      and(
        eq(account.userId, existingUser.id),
        eq(account.providerId, "credential")
      )
    );

  // Delete the used token
  await db.delete(verification).where(eq(verification.id, verif.id));

  return NextResponse.json({ message: "Password has been reset successfully" });
}
