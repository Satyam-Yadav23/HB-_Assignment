import { beforeUserCreated, beforeUserSignedIn } from "firebase-functions/v2/identity";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { MongoClient, type Collection } from "mongodb";

const allowedEmail = /^[^@]+@hbplus\.fit$/i;
const mongoUri = defineSecret("MONGODB_URI");

type UserProfile = {
  _id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: "admin" | "user";
  emailVerified: true;
  provider: string;
  createdAt: Date;
  lastLoginAt: Date;
};

let mongoClientPromise: Promise<MongoClient> | undefined;

function getMongoClient(uri: string): Promise<MongoClient> {
  if (!mongoClientPromise) {
    const client = new MongoClient(uri);
    mongoClientPromise = client.connect().catch((error: unknown) => {
      mongoClientPromise = undefined;
      throw error;
    });
  }
  return mongoClientPromise;
}

function enforceAllowedDomain(email: string | undefined, emailVerified: boolean | undefined): void {
  if (!email || !allowedEmail.test(email) || emailVerified !== true) {
    throw new HttpsError(
      "permission-denied",
      "Access restricted. Please login using your official domain email.",
    );
  }
}

export const restrictNewUsers = beforeUserCreated((event) => {
  enforceAllowedDomain(event.data?.email, event.data?.emailVerified);
});

export const restrictUserSignIns = beforeUserSignedIn((event) => {
  enforceAllowedDomain(event.data?.email, event.data?.emailVerified);
});

const allowedWebOrigins = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.web\.app$/,
  /\.firebaseapp\.com$/,
];

export const syncUserProfile = onCall(
  { secrets: [mongoUri], cors: allowedWebOrigins },
  async (request) => {
    const user = request.auth;
    if (!user) {
      throw new HttpsError("unauthenticated", "Sign in before syncing your profile.");
    }

    const email = user.token.email;
    if (
      typeof email !== "string"
      || user.token.email_verified !== true
      || !allowedEmail.test(email)
      || user.token.firebase?.sign_in_provider !== "google.com"
    ) {
      throw new HttpsError(
        "permission-denied",
        "Only verified @hbplus.fit Google accounts can be stored.",
      );
    }

    const uri = mongoUri.value();
    if (!uri) {
      throw new HttpsError("failed-precondition", "Configure the MONGODB_URI Firebase secret before syncing profiles.");
    }

    let client: MongoClient;
    try {
      client = await getMongoClient(uri);
    } catch (error) {
      console.error("MongoDB connection failed.", error);
      throw new HttpsError("unavailable", "The profile database is unavailable. Please try again later.");
    }
    const users: Collection<UserProfile> = client.db().collection<UserProfile>("users");
    const now = new Date();
    const profile: Omit<UserProfile, "_id" | "createdAt"> = {
      email,
      displayName: typeof user.token.name === "string" ? user.token.name : null,
      photoURL: typeof user.token.picture === "string" ? user.token.picture : null,
      role: user.token.admin === true ? "admin" : "user",
      emailVerified: true,
      provider: "google.com",
      lastLoginAt: now,
    };

    try {
      await users.updateOne(
        { _id: user.uid },
        { $set: profile, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
    } catch (error) {
      console.error("MongoDB profile upsert failed.", error);
      throw new HttpsError("unavailable", "Could not save your profile. Please try again.");
    }

    return { success: true };
  },
);
