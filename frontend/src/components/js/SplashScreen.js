import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,   // React Native eke built-in animation library
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import styles, { COLORS } from '../css/SplashScreenStyles';

// =====================================================
// App eke features 3k (Icon + Label)
// Feature row eke render karannata use karanawa
// =====================================================
const FEATURES = [
    { icon: 'flash-outline',      label: 'Fast'     },
    { icon: 'shield-checkmark-outline', label: 'Safe'     },
    { icon: 'star-outline',       label: 'Top Rated' },
];

// =====================================================
// SplashScreen Component
// App open wenakotat panna pennena Welcome screen eka
// =====================================================
export default function SplashScreen() {

    const router = useRouter();

    // =====================================================
    // Animated Values — useRef eken save karanawa
    // useRef: Re-render wenakotat value eka reset wenawa eka prevent karanawa
    // =====================================================

    // Logo walata: opacity (0 → 1 fade in) + scale (0.5 → 1 zoom in)
    const logoOpacity   = useRef(new Animated.Value(0)).current;
    const logoScale     = useRef(new Animated.Value(0.5)).current;

    // Title + Tagline walata: opacity + translateY (yathin uda slide up)
    const titleOpacity  = useRef(new Animated.Value(0)).current;
    const titleY        = useRef(new Animated.Value(30)).current;  // 30px yathin start

    // Features row walata: opacity + translateY
    const featOpacity   = useRef(new Animated.Value(0)).current;
    const featY         = useRef(new Animated.Value(20)).current;

    // Button walata: opacity + translateY
    const btnOpacity    = useRef(new Animated.Value(0)).current;
    const btnY          = useRef(new Animated.Value(40)).current;  // 40px yathin start

    // =====================================================
    // useEffect - Component load wenakotat animations start karanawa
    // =====================================================
    useEffect(() => {
        // Animated.sequence eken animations eka passe eka run karanawa
        Animated.sequence([

            // 1. Logo fade in + zoom in (300ms delay passe)
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,          // 0 → 1 (invisible → visible)
                    duration: 600,
                    useNativeDriver: true, // Performance walata GPU use karanawa
                }),
                Animated.spring(logoScale, {
                    toValue: 1,          // 0.5 → 1 (small → normal size)
                    friction: 6,         // Spring bounce amount eka
                    useNativeDriver: true,
                }),
            ]),

            // 2. Title + Tagline slide up (logo passe)
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(titleY, {
                    toValue: 0,          // 30px yathin → original position ekata
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),

            // 3. Features row fade in
            Animated.parallel([
                Animated.timing(featOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(featY, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),

            // 4. Button slide up (last - attention draw karanawa)
            Animated.delay(100),
            Animated.parallel([
                Animated.timing(btnOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(btnY, {
                    toValue: 0,          // 40px yathin → original position ekata
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),

        ]).start(); // Animation sequence eka start karanawa
    }, []); // [] - eka witirak run wenawa (mount wenakotat)

    // =====================================================
    // UI
    // =====================================================
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.container}>

                {/* ---- Top Spacer ---- */}
                <View style={styles.topSpacer} />

                {/* ---- Center Content (Logo + Text + Features) ---- */}
                <View style={styles.centerContent}>

                    {/* -- Logo (Animated: fade + zoom) -- */}
                    {/* Animated.View use karanawa — animate karannata normal View baha */}
                    <Animated.View style={{
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    }}>
                        <View style={styles.logoOuterRing}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="fast-food" size={56} color="#FFFFFF" />
                            </View>
                        </View>
                    </Animated.View>

                    {/* -- App Name + Tagline (Animated: fade + slide up) -- */}
                    <Animated.View style={{
                        opacity: titleOpacity,
                        transform: [{ translateY: titleY }],
                        alignItems: 'center',
                    }}>
                        {/* "Quick" eka emerald accent, "Bite" eka sudu - two Text spans */}
                        <Text style={styles.appName}>
                            <Text style={styles.appNameAccent}>Quick</Text>Bite
                        </Text>
                        <Text style={styles.tagline}>
                            Deliciousness delivered{'\n'}to your doorstep.
                        </Text>
                    </Animated.View>

                    {/* -- Features Row (Animated: fade + slide up) -- */}
                    <Animated.View style={[
                        styles.featuresRow,
                        { opacity: featOpacity, transform: [{ translateY: featY }] }
                    ]}>
                        {/* FEATURES array eka .map() kara eka eka feature card render karanawa */}
                        {FEATURES.map((feat) => (
                            <View key={feat.label} style={styles.featureItem}>
                                <View style={styles.featureIconBox}>
                                    <Ionicons name={feat.icon} size={22} color={COLORS.accent} />
                                </View>
                                <Text style={styles.featureText}>{feat.label}</Text>
                            </View>
                        ))}
                    </Animated.View>

                </View>{/* End Center Content */}

                {/* ---- Bottom Content (Button + Login Link) ---- */}
                {/* Animated: slide up from bottom */}
                <Animated.View style={[
                    styles.bottomContent,
                    { opacity: btnOpacity, transform: [{ translateY: btnY }] }
                ]}>

                    {/* -- Get Started Button -- */}
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={() => router.push('/login')} // Login screen ekata yawanawa
                        activeOpacity={0.85}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                        <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* -- Already have account? Login -- */}
                    <View style={styles.loginPrompt}>
                        <Text style={styles.loginPromptText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.loginPromptLink}> Login</Text>
                        </TouchableOpacity>
                    </View>

                    {/* -- Version -- */}
                    <Text style={styles.versionText}>QuickBite v1.0.0</Text>

                </Animated.View>

            </View>
        </>
    );
}
