import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function PageShell({ children }: { children: ReactNode }) {
  return <View style={styles.page}>{children}</View>;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#f4f7fb",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
