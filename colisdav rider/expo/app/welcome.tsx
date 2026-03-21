import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { User, ArrowRight } from "lucide-react-native";
import { Colors } from "@/constants/color";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("../assets/images/funaab.png")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Dark Gradient-like Overlay */}
        <View style={styles.overlay} />

        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View 
            style={[
              styles.logoContainer, 
              { opacity: fadeAnim, transform: [{ scale: logoScale }] }
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image 
                source={require("../assets/images/colisdav.png")} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            {/* <Text style={styles.brandName}>Colisdav</Text> */}
          </Animated.View>

          {/* Text Section */}
          <Animated.View 
            style={[
              styles.textContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.title}>Drive Your Future</Text>
            <Text style={styles.tagline}>
              Empowering campus mobility. Join the elite network of student drivers and turn every trip into an opportunity.
            </Text>
          </Animated.View>

          {/* Action Section */}
          <Animated.View 
            style={[
              styles.actionContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <View style={styles.iconCircle}>
                <ArrowRight size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>
                Already a member? <Text style={styles.loginHighlight}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.linkText}>Terms</Text> &{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker for better text readability
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: height * 0.12,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoWrapper: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  brandName: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,
  },
  textContainer: {
    alignItems: "center",
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  actionContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    width: "100%",
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginRight: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    backgroundColor: "white",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  loginHighlight: {
    color: "white",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  footer: {
    width: "100%",
    marginTop: 20,
  },
  termsText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
