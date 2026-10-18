import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { auth } from "@/lib/firebase";
import { syncUserProfile } from "@/lib/userProfile";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardScreen() {
  const { user, role, loading, roleLoading, signingOut, error: authError, signOutUser } = useAuth();
  const router = useRouter();
  const [profileSync, setProfileSync] = useState<"saving" | "saved" | "error">("saving");
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null);
  const [profileSyncAttempt, setProfileSyncAttempt] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setProfileSync("saving");
    setProfileSyncError(null);
    void syncUserProfile().then(() => {
      if (active) setProfileSync("saved");
    }).catch((error: unknown) => {
      console.error("Unable to sync the signed-in user's MongoDB profile.", error);
      if (active) {
        setProfileSync("error");
        setProfileSyncError(error instanceof Error ? error.message : "Unknown profile save error.");
      }
    });
    return () => {
      active = false;
    };
  }, [user, profileSyncAttempt]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.replace("/");
    } catch (error) {
      console.error("Unable to sign out.", error);
    }
  };

  if (loading || roleLoading || !user) {
    return <PageShell><ActivityIndicator size="large" color="#147d72" /></PageShell>;
  }

  const initials = (user.displayName ?? user.email ?? "H")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <PageShell>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topbar}>
          <BrandMark compact />
          <Text style={styles.brandName}>HB PLUS</Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            disabled={signingOut}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          >
            {signingOut ? <ActivityIndicator size="small" color="#486581" /> : <Text style={styles.signOutText}>Sign out</Text>}
          </Pressable>
        </View>

        <View style={styles.welcome}>
          <View style={styles.eyebrow}><View style={styles.onlineDot} /><Text style={styles.eyebrowText}>WORKSPACE SECURE</Text></View>
          <Text style={styles.heading}>Welcome back{user.displayName ? "," : ""}</Text>
          {user.displayName ? <Text style={styles.name}>{user.displayName.split(" ")[0]}.</Text> : null}
          <Text style={styles.subheading}>You’re signed in to the HB Plus team workspace.</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.displayName ?? "HB Plus member"}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <View style={styles.verified}><Text style={styles.check}>✓</Text></View>
        </View>

        <View style={[styles.syncNotice, profileSync === "error" && styles.syncError]}>
          <Text style={styles.syncText}>
            {profileSync === "saving"
              ? "Saving your profile securely…"
              : profileSync === "saved"
                ? "Your profile is saved securely."
                : profileSyncError ?? "Your profile could not be saved to the database."}
          </Text>
          {profileSync === "error" ? (
            <Pressable accessibilityRole="button" onPress={() => setProfileSyncAttempt((attempt) => attempt + 1)}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>ACCOUNT STATUS</Text>
            <View style={styles.statusRow}><View style={styles.onlineDot} /><Text style={styles.status}>Verified</Text></View>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>WORKSPACE ROLE</Text>
            <Text style={styles.status}>{role === "admin" ? "Admin" : "User"}</Text>
          </View>
        </View>

        {authError ? <Text accessibilityRole="alert" style={styles.authError}>{authError}</Text> : null}

        {role === "admin" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/admin")}
            style={({ pressed }) => [styles.adminLink, pressed && styles.pressed]}
          >
            <Text style={styles.adminLinkTitle}>Open admin console</Text>
            <Text style={styles.adminLinkArrow}>›</Text>
          </Pressable>
        ) : null}

        <View style={styles.notice}>
          <View style={styles.noticeIcon}><Text style={styles.noticeIconText}>✦</Text></View>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>You’re all set</Text>
            <Text style={styles.noticeBody}>Your official account has access to this private workspace.</Text>
          </View>
        </View>
        <Text style={styles.sessionId}>SIGNED IN AS · {auth.currentUser?.uid.slice(0, 8).toUpperCase()}</Text>
      </ScrollView>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 850, paddingVertical: 8, flexGrow: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5edf4",
    paddingBottom: 18,
    gap: 10,
  },
  brandName: { color: "#102a43", fontSize: 13, fontWeight: "800", letterSpacing: 1.1, flex: 1 },
  signOut: { paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: "#d6e0ea", borderRadius: 10, backgroundColor: "#fff" },
  signOutText: { color: "#486581", fontSize: 13, fontWeight: "600" },
  pressed: { opacity: 0.7 },
  welcome: { marginTop: 48, marginBottom: 30 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
  onlineDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: "#20a58a" },
  eyebrowText: { color: "#147d72", fontSize: 10, letterSpacing: 1.1, fontWeight: "800" },
  heading: { color: "#102a43", fontSize: 35, fontWeight: "700", letterSpacing: -1.1 },
  name: { color: "#147d72", fontSize: 35, fontWeight: "700", letterSpacing: -1.1, marginTop: 1 },
  subheading: { color: "#627d98", fontSize: 15, lineHeight: 23, marginTop: 12 },
  profileCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e5edf4", padding: 20, flexDirection: "row", alignItems: "center", gap: 15 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#e8f5f2" },
  avatarText: { color: "#147d72", fontSize: 16, fontWeight: "800" },
  profileInfo: { flex: 1 },
  profileName: { color: "#243b53", fontSize: 15, fontWeight: "700" },
  email: { color: "#829ab1", fontSize: 13, marginTop: 5 },
  verified: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#e8f5f2", alignItems: "center", justifyContent: "center" },
  check: { color: "#147d72", fontSize: 14, fontWeight: "800" },
  syncNotice: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, backgroundColor: "#e8f5f2", marginTop: 12 },
  syncError: { backgroundColor: "#fff1f0" },
  syncText: { color: "#486581", fontSize: 12, flex: 1 },
  retryText: { color: "#147d72", fontWeight: "700", fontSize: 12 },
  authError: { color: "#b42318", backgroundColor: "#fff1f0", borderRadius: 10, padding: 12, fontSize: 13, marginTop: 14 },
  adminLink: { marginTop: 14, padding: 17, borderRadius: 13, backgroundColor: "#102a43", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  adminLinkTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  adminLinkArrow: { color: "#fff", fontSize: 22 },
  infoGrid: { flexDirection: "row", gap: 14, marginTop: 14 },
  infoCard: { flex: 1, padding: 18, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5edf4", minHeight: 92 },
  label: { color: "#829ab1", fontSize: 9, letterSpacing: 1.1, fontWeight: "800", marginBottom: 11 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  status: { color: "#243b53", fontSize: 14, fontWeight: "600" },
  notice: { flexDirection: "row", alignItems: "center", gap: 14, padding: 19, borderRadius: 14, backgroundColor: "#e8f5f2", marginTop: 22 },
  noticeIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#ccebe4" },
  noticeIconText: { color: "#147d72", fontSize: 20 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: "#14594f", fontSize: 14, fontWeight: "700" },
  noticeBody: { color: "#486581", fontSize: 12, lineHeight: 18, marginTop: 4 },
  sessionId: { color: "#9fb3c8", fontSize: 9, letterSpacing: 1, fontWeight: "700", marginTop: 27 },
});
