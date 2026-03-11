import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { scrypt as scryptCb, randomBytes, timingSafeEqual } from "crypto";
import { headers } from "next/headers";

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

function verifyPassword(hash: string, password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return resolve(false);
    scryptCb(
      Buffer.from(password.normalize("NFKC")),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, derivedKey) => {
        if (err) return reject(err);
        try {
          resolve(timingSafeEqual(derivedKey, Buffer.from(key, "hex")));
        } catch {
          resolve(false);
        }
      }
    );
  });
}

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Both current and new passwords are required" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Get the current password hash
  const [acct] = await db
    .select({ password: account.password })
    .from(account)
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "credential")
      )
    )
    .limit(1);

  if (!acct || !acct.password) {
    return NextResponse.json(
      { error: "No password set for this account" },
      { status: 400 }
    );
  }

  // Verify current password
  const valid = await verifyPassword(acct.password, currentPassword);
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  // Hash and save new password
  const hashedPassword = await hashPassword(newPassword);
  await db
    .update(account)
    .set({ password: hashedPassword })
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "credential")
      )
    );

  return NextResponse.json({ message: "Password changed successfully" });
}
