import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./config";
import { applySeedPlan } from "./seedDataHelpers";

export async function seedDatabase(force = false) {
  return applySeedPlan({
    db,
    force,
    firestore: { collection, doc, getDoc, getDocs, writeBatch },
    logger: (message) => console.log(message),
  });
}
