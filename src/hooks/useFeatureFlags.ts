import { useContext } from "react";
import { FeatureFlagContext } from "../providers/FeatureFlagProvider";

export default function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
