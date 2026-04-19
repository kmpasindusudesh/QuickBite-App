import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Already installed - @expo/vector-icons
import { useRouter } from 'expo-router';        // Expo Router eke navigation hook eka

// API_BASE_URL = src/config.js eken import karanawa (../../config = js folder eken 2 step uda giyala src/)
import { API_BASE_URL } from '../../config';
import { saveToken, saveUser } from '../../utils/storage'; // Token save karannata helper eka
import styles, { COLORS } from '../css/LoginScreenStyles'; // Styles eka css folder eken genawa

// =====================================================
// LoginScreen Component
// User ta login wennat hadapu screen eka
// =====================================================
export default function LoginScreen() {

    const router = useRouter(); // Page navigation walata (expo-router)

    // ---------- State Variables ----------
    // Form fields walata data save karanawa (useState)
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');

    // Password eka pennanna / hiddenna toggle ekak
    const [showPassword, setShowPassword] = useState(false);

    // API call karanakotat loading spinner pennawa
    const [isLoading, setIsLoading] = useState(false);

    // Error message pennanna (API error, validation error)
    const [errorMsg, setErrorMsg] = useState('');

    // Input focus track karanawa (focus wenakotat border color change wenawa)
    const [focusedInput, setFocusedInput] = useState('');

    // =====================================================
    // handleLogin - Login Button press wenakotat yana function
    // =====================================================
    const handleLogin = async () => {
        // 1. Kalin error eka clear karanawa
        setErrorMsg('');

        // 2. Basic validation - fields blank da balanawa
        if (!email || !password) {
            setErrorMsg('Please enter both your email address and password.');
            return;
        }

        // 3. Email format eka valid da simple check
        if (!email.includes('@')) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        setIsLoading(true); // Loading spinner show karanawa

        // Full URL eka hadanawa — meka config.js eke API_BASE_URL eka use karanawa (hardcode nadha)
        const loginUrl = `${API_BASE_URL}/auth/login`;

        try {
            // ---------- Inner try 1: fetch (network level errors) ----------
            // Internet naha, wrong IP, timeout, SSL — me errors fetch eke catch eken enawa
            let response;
            try {
                response = await fetch(loginUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
            } catch (fetchError) {
                // fetch fail unoth (eg: "Network request failed") — Error object eke message eka thiyanawa
                const msg =
                    fetchError?.message != null
                        ? String(fetchError.message)
                        : String(fetchError);
                console.error('[Login] Fetch failed:', fetchError);
                setErrorMsg(msg);
                Alert.alert('Login — Network / Fetch Error', msg);
                return;
            }

            // ---------- Inner try 2: response body read + JSON parse ----------
            // Server eka HTML error page (500) denakotat response.json() crash wenawa — text() + parse safe
            let data = {};
            try {
                const rawText = await response.text();
                if (rawText && rawText.trim() !== '') {
                    try {
                        data = JSON.parse(rawText);
                    } catch (parseErr) {
                        // Body eka JSON naha (HTML "Server Error" wage) — debug karanna lassanai
                        const preview = rawText.substring(0, 120);
                        const parseMsg =
                            parseErr?.message != null
                                ? String(parseErr.message)
                                : String(parseErr);
                        const fullMsg = `Status ${response.status}. JSON parse fail: ${parseMsg}\nBody start: ${preview}...`;
                        console.error('[Login] Not JSON body:', rawText);
                        setErrorMsg(fullMsg);
                        Alert.alert('Login — Response not JSON', fullMsg);
                        return;
                    }
                }
            } catch (readError) {
                const msg =
                    readError?.message != null
                        ? String(readError.message)
                        : String(readError);
                console.error('[Login] Read body failed:', readError);
                setErrorMsg(msg);
                Alert.alert('Login — Read response failed', msg);
                return;
            }

            if (!response.ok) {
                // HTTP error (400, 401, 500) — server eken JSON message eka thiyenawa usually
                const serverMsg = data.message || `HTTP ${response.status}`;
                setErrorMsg(serverMsg);
                Alert.alert('Login — Server replied error', serverMsg);
                return;
            }

            // Login success — token saha user save
            await saveToken(data.token);
            await saveUser(data.user);

            // Manager log unama yana default path eka /add-restaurant idan /manager-dashboard ekata wenas kala.
            // Tab bar landing — Manager: dashboard (My Restaurants tab); customer/rider: Home
            const loginRole = String(data.user?.role ?? '').toLowerCase().trim();
            if (loginRole === 'manager') {
                router.replace('/manager-dashboard');
            } else if (loginRole === 'rider') {
                router.replace('/home');
            } else {
                router.replace('/home');
            }
        } catch (error) {
            // Unexpected errors (saveToken fail, router, etc.) — error.message eka pennawa
            const msg =
                error?.message != null ? String(error.message) : String(error);
            console.error('[Login] Unexpected:', error);
            setErrorMsg(msg);
            Alert.alert('Login — Unexpected error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================================
    // UI (Screen eke pennena kota)
    // =====================================================
    return (
        <>
            {/* Status bar eka dark theme ekata matching karanawa */}
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            {/* KeyboardAvoidingView - Keyboard yana wela inputs hide wenawa eka fix karanawa */}
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: COLORS.background }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled" // Input tapa kara keyboard nathe gena ganna
                >
                    <View style={styles.container}>

                        {/* ---- Logo / Brand Area ---- */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                {/* Ionicons - @expo/vector-icons eke icon set ekak */}
                                <Ionicons name="fast-food" size={38} color="#FFFFFF" />
                            </View>
                            <Text style={styles.appName}>QuickBite</Text>
                            <Text style={styles.appTagline}>Fast food, delivered faster 🚀</Text>
                        </View>

                        {/* ---- Form Card ---- */}
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Welcome Back!</Text>

                            {/* ---- Error Message Box ---- */}
                            {/* errorMsg thiyanam witharak pennawa */}
                            {errorMsg !== '' && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                                    <Text style={styles.errorText}>{errorMsg}</Text>
                                </View>
                            )}

                            {/* ---- Email Input ---- */}
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'email' && styles.inputWrapperFocused // Focus border
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={focusedInput === 'email' ? COLORS.accent : COLORS.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email address"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}           // Type karanakotat state update wenawa
                                    keyboardType="email-address"      // Email keyboard eka
                                    autoCapitalize="none"             // Auto capital letters off
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput('')}
                                />
                            </View>

                            {/* ---- Password Input ---- */}
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'password' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedInput === 'password' ? COLORS.accent : COLORS.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword} // True nam password dots pennawa
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput('')}
                                />
                                {/* Eye icon - password show/hide toggle */}
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={COLORS.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* ---- Login Button ---- */}
                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading} // Loading wenakotat button disable wenawa
                                activeOpacity={0.85}
                            >
                                {isLoading ? (
                                    // Loading wenakotat spinner ekak pennawa
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                                        <Text style={styles.loginButtonText}>Login</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* ---- Divider ---- */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* ---- Register Link ---- */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/register')}>
                                    <Text style={styles.registerLink}>Register</Text>
                                </TouchableOpacity>
                            </View>

                        </View>{/* End Form Card */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}
