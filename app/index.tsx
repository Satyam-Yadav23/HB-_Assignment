import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BrandMark } from "@/components/BrandMark";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, router, user]);

  if (loading || user) {
    return (
      <PageShell>
        <ActivityIndicator size="large" color="#147d72" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <BrandMark />
          <View style={styles.intro}>
            <View style={styles.pill}><View style={styles.dot} /><Text style={styles.pillText}>PRIVATE TEAM ACCESS</Text></View>
            <Text style={styles.heading}>Good work{`\n`}starts together.</Text>
            <Text style={styles.description}>
              Sign in to your HB Plus workspace with your official account.
            </Text>
          </View>
          <GoogleSignInButton />
          <View style={styles.divider} />
          <Text style={styles.policy}>Access is available only to verified @hbplus.fit accounts.</Text>
          <Text style={styles.footer}>SECURE SIGN-IN · GOOGLE AUTHENTICATION</Text>
        </View>
        <Text style={styles.outside}>A focused space for the people behind HB Plus.</Text>
      </ScrollView>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, width: "100%", maxWidth: 480, justifyContent: "center", paddingVertical: 18 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "#e5edf4",
  },
  intro: { marginTop: 46, marginBottom: 30 },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#e8f5f2",
  },
  dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: "#147d72" },
  pillText: { color: "#147d72", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  heading: { color: "#102a43", fontSize: 39, lineHeight: 45, fontWeight: "700", letterSpacing: -1.3, marginTop: 19 },
  description: { color: "#627d98", fontSize: 15, lineHeight: 23, marginTop: 14, maxWidth: 340 },
  divider: { height: 1, backgroundColor: "#edf2f7", marginTop: 25, marginBottom: 18 },
  policy: { color: "#627d98", textAlign: "center", fontSize: 12, lineHeight: 18 },
  footer: { color: "#9fb3c8", textAlign: "center", fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginTop: 26 },
  outside: { textAlign: "center", color: "#829ab1", fontSize: 12, marginTop: 20 },
});
