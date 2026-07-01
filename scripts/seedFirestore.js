import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, writeBatch } from "firebase/firestore";
import { applySeedPlan } from "../src/firebase/seedDataHelpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

function readEnv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...rest] = line.split("=");
        return [key, rest.join("=")];
      })
  );
}

const env = readEnv(envPath);
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const force = process.argv.includes("--force");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  await applySeedPlan({
    db,
    force,
    firestore: { collection, doc, getDoc, getDocs, writeBatch },
    logger: (message) => console.log(message),
  });
  process.exit(0);
} catch (error) {
  console.error("SEEDING FAILED.");
  console.error(error);
  process.exit(1);
}
