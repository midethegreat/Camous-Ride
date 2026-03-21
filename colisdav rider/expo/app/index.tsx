import { Redirect } from "expo-router";

export default function Index() {
  // For now, always redirect to welcome
  return <Redirect href="/welcome" />;
}
