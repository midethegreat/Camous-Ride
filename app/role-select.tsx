import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GraduationCap, Users, ArrowRight, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";

export default function RoleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isLogin = String(mode || "").toLowerCase() === "login";
  const pulse = useRef(new Animated.Value(1)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const studentScale = useRef(new Animated.Value(1)).current;
  const guestScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();

    const up = (val: Animated.Value, d: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: -8, duration: d, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: d, useNativeDriver: true }),
        ]),
      ).start();
    up(float1, 2200);
    up(float2, 2600);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.hero}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={[styles.backBtn, { top: insets.top + 10 }]}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <ArrowLeft size={18} color={Colors.primary} />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <View style={styles.logoBadge}>
            <Image
              source={require("../assets/images/colisdav.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        <Text style={styles.heroTitle}>{isLogin ? "Log in to continue" : "Get started with COLISDAV"}</Text>
        <Text style={styles.heroSub}>
          Choose a role that best describes you
        </Text>

        <Animated.View style={[styles.floatDot, { transform: [{ translateY: float1 }], left: 24 }]} />
        <Animated.View style={[styles.floatDot, { transform: [{ translateY: float2 }], right: 28 }]} />
      </LinearGradient>

      <View style={styles.sheet}>
        <View style={styles.cards}>
          <Animated.View style={{ flex: 1, transform: [{ scale: studentScale }] }}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push((isLogin ? "/login" : "/onboarding") as never)}
              onPressIn={() => Animated.spring(studentScale, { toValue: 0.98, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(studentScale, { toValue: 1, useNativeDriver: true }).start()}
              activeOpacity={0.9}
            >
              <View style={[styles.iconWrap, { backgroundColor: Colors.primaryLight }]}>
                <GraduationCap size={28} color={Colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Student</Text>
                <Text style={styles.cardDesc}>Verify quickly with your matric number to unlock.</Text>
              </View>
              <View style={styles.cardCta}>
                <Text style={styles.cardCtaText}>{isLogin ? "Login" : "Continue"}</Text>
                <ArrowRight size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ flex: 1, transform: [{ scale: guestScale }] }}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push((isLogin ? "/guest-login" : "/guest-onboarding") as never)}
              onPressIn={() => Animated.spring(guestScale, { toValue: 0.98, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(guestScale, { toValue: 1, useNativeDriver: true }).start()}
              activeOpacity={0.9}
            >
              <View style={[styles.iconWrap, { backgroundColor: Colors.accentLight }]}>
                <Users size={28} color={Colors.accent} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Guest</Text>
                <Text style={styles.cardDesc}>Visitors and alumni can ride without student verification.</Text>
              </View>
              <View style={[styles.cardCta, { backgroundColor: Colors.accent }]}>
                <Text style={styles.cardCtaText}>{isLogin ? "Login" : "Continue"}</Text>
                <ArrowRight size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 0,
  },
  hero: {
    height: 240,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logo: {
    width: 130,
    height: 60,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.white,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  floatDot: {
    position: "absolute",
    top: 28,
    width: 12,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
  },
  sheet: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  cards: {
    marginBottom: 300,
    gap: 14,
    flexDirection: "row",
    alignItems: "stretch",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    minHeight: 220,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardBody: {
    flexGrow: 1,
    width: "100%",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.dark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 12,
  },
  cardCta: {
    marginTop: 2,
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cardCtaText: {
    color: Colors.white,
    fontWeight: "700",
  },
});
