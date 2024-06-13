import { useContext } from "react";
import { FirebaseContext } from "../providers/FirebaseProvider";

export default function useFirebaseApp() {
  const app = useContext(FirebaseContext);
  if (!app) throw new Error("Firebase is not properly configured.");
  return app;
}
