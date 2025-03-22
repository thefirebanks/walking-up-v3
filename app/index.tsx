import { Redirect } from "expo-router";

// Simply redirect to the tabs section which will handle authentication appropriately
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
