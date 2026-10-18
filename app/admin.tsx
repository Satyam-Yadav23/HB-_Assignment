import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminScreen() {
  const { user, role, loading, roleLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !roleLoading && !user) router.replace("/");
    else if (!loading && !roleLoading && user && role !== "admin") router.replace("/dashboard");
  }, [loading, roleLoading, role, router, user]);

  if (loading || roleLoading || !user || role !== "admin") {
    return <PageShell><ActivityIndicator size="large" color="#147d72" /></PageShell>;
  }

  return (
    <PageShell>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <BrandMark compact />
          <Text style={styles.brand}>HB PLUS · ADMIN</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/dashboard")} style={styles.back}>
            <Text style={styles.backText}>Dashboard</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>ADMINISTRATOR ACCESS</Text>
          <Text style={styles.title}>Admin console</Text>
          <Text style={styles.description}>
            This protected area is available only to accounts with the trusted Firebase admin claim.
          </Text>
          <View style={styles.identity}>
            <Text style={styles.label}>SIGNED IN ACCOUNT</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <Text style={styles.note}>
            Admin access is assigned by a trusted Firebase administrator. It cannot be changed from this app.
          </Text>
        </View>
      </ScrollView>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 850, paddingVertical: 8, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#e5edf4", paddingBottom: 18 },
  brand: { flex: 1, color: "#102a43", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  back: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 9, backgroundColor: "#fff", borderWidth: 1, borderColor: "#d6e0ea" },
  backText: { color: "#486581", fontSize: 12, fontWeight: "600" },
  card: { marginTop: 44, padding: 26, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5edf4", borderRadius: 18 },
  eyebrow: { color: "#147d72", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#102a43", fontSize: 30, fontWeight: "700", marginTop: 12 },
  description: { color: "#627d98", fontSize: 14, lineHeight: 22, marginTop: 10 },
  identity: { marginTop: 28, padding: 16, backgroundColor: "#f4f7fb", borderRadius: 12 },
  label: { color: "#829ab1", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  email: { color: "#243b53", fontSize: 14, fontWeight: "600", marginTop: 8 },
  note: { color: "#829ab1", fontSize: 12, lineHeight: 18, marginTop: 22 },
});
