import { useEffect } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

WebBrowser.maybeCompleteAuthSession();

const googleClientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export function GoogleSignInButton() {
  const { signIn, signingIn, error, clearError, reportError } = useAuth();
  const [prompting, setPrompting] = useState(false);
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    ...googleClientIds,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (!response || Platform.OS === "web") return;
    setPrompting(false);
    if (response.type === "success") {
      const idToken = response.authentication?.idToken ?? response.params?.id_token;
      void signIn(idToken).catch(() => undefined);
    } else if (response.type === "error") {
      reportError(response.error?.message ?? "Google sign-in could not be completed.");
    }
  }, [response, signIn, reportError]);

  const handlePress = async () => {
    clearError();
    if (Platform.OS === "web") {
      await signIn().catch(() => undefined);
      return;
    }
    setPrompting(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") setPrompting(false);
    } catch (promptError) {
      setPrompting(false);
      reportError(promptError instanceof Error ? promptError.message : "Google sign-in could not be completed.");
    }
  };

  const busy = signingIn || prompting;
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        disabled={busy || (Platform.OS !== "web" && !request)}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          (busy || (Platform.OS !== "web" && !request)) && styles.disabled,
        ]}
      >
        {busy ? (
          <ActivityIndicator color="#102a43" />
        ) : (
          <>
            <Text style={styles.googleMark}>G</Text>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </>
        )}
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", gap: 14 },
  button: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d6e0ea",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
  },
  pressed: { backgroundColor: "#f4f7fb" },
  disabled: { opacity: 0.62 },
  googleMark: { color: "#4285f4", fontSize: 21, fontWeight: "800" },
  buttonText: { color: "#243b53", fontSize: 15, fontWeight: "600" },
  error: {
    color: "#b42318",
    backgroundColor: "#fff1f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
});
