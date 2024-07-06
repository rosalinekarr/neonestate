import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
} from "firebase/remote-config";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useFirebaseApp } from "../hooks";

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagContext = createContext<Record<string, boolean>>({});

export default function FeatureFlagProvider({
  children,
}: FeatureFlagProviderProps) {
  const app = useFirebaseApp();
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadFlags() {
      const remoteConfig = getRemoteConfig(app);
      await fetchAndActivate(remoteConfig);

      setFeatureFlags(
        Object.fromEntries(
          Object.entries(getAll(remoteConfig)).map(([key, val]) => [
            key,
            val.asBoolean(),
          ]),
        ),
      );
    }

    loadFlags();
  }, [app]);

  return (
    <FeatureFlagContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
