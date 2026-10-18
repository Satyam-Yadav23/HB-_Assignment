import { StyleSheet, Text, View } from "react-native";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brand}>
      <View style={[styles.icon, compact && styles.smallIcon]}>
        <Text style={[styles.iconText, compact && styles.smallIconText]}>H</Text>
      </View>
      {!compact ? (
        <View>
          <Text style={styles.name}>HB PLUS</Text>
          <Text style={styles.caption}>TEAM WORKSPACE</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#147d72",
  },
  smallIcon: { width: 36, height: 36, borderRadius: 11 },
  iconText: { color: "#fff", fontSize: 21, fontWeight: "800" },
  smallIconText: { fontSize: 18 },
  name: { color: "#102a43", fontSize: 14, fontWeight: "800", letterSpacing: 1.3 },
  caption: { color: "#829ab1", fontSize: 9, fontWeight: "700", letterSpacing: 1.7, marginTop: 3 },
});
