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
import { Ionicons } from '@expo/vector-icons'; // Already installed
import { useRouter } from 'expo-router';

import { API_BASE_URL } from '../../config';                    // Backend URL eka genawa
import styles, { COLORS } from '../css/RegisterScreenStyles';   // Styles genawa

// =====================================================
// Role options define karanawa - name, icon, value
// Me array eka use kara 3 role cards render karanawa
// =====================================================
const ROLES = [
    { label: 'Customer',  value: 'customer', icon: 'person-outline'   },
    { label: 'Manager',   value: 'manager',  icon: 'briefcase-outline' },
    { label: 'Rider',     value: 'rider',    icon: 'bicycle-outline'   },
];

// =====================================================
// RegisterScreen Component
// Aluth user kenek register wennat hadapu screen eka
// =====================================================
export default function RegisterScreen() {

    const router = useRouter(); // Page navigation walata

    // ---------- State Variables ----------
    const [name, setName]           = useState('');
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // Sri Lanka mobile number — 07XXXXXXXX wage 10 digits
    const [phone, setPhone] = useState('');

    // Default role eka 'customer' karanawa
    const [role, setRole] = useState('customer');

    // Password fields show/hide toggle rende walatamat venas state
    const [showPassword, setShowPassword]   = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg]   = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Input focus track karanawa
    const [focusedInput, setFocusedInput] = useState('');

    // =====================================================
    // handleRegister - Register button press wenakotat
    // =====================================================
    const handleRegister = async () => {
        // 1. Messages clear karanawa
        setErrorMsg('');
        setSuccessMsg('');

        // 2. Validation - fields blank da balanawa
        if (!name || !email || !password || !confirmPw) {
            setErrorMsg('Please fill in all required fields.');
            return;
        }

        // 3. Email valid da balanawa
        if (!email.includes('@')) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        // 4. Password length check
        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }

        // 5. Password match karenawada balanawa
        if (password !== confirmPw) {
            setErrorMsg('Passwords do not match. Please try again.');
            return;
        }

        // 6. Phone validation — Sri Lanka mobile 07XXXXXXXX wage exactly 10 digits
        if (phone && phone.length !== 10) {
            Alert.alert('Validation', 'Phone number must be exactly 10 digits');
            return;
        }

        setIsLoading(true); // Loading spinner show karanawa

        try {
            // 6. Backend API ekata register request yawanawa
            // Full URL: http://192.168.x.x:5000/api/auth/register
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role, phone }),
            });

            const data = await response.json(); // Server response genawa

            if (!response.ok) {
                // 7. Server error awoth (eg: email already exists)
                setErrorMsg(data.message || 'Registration failed. Please try again.');
                return;
            }

            // 8. Register success!
            setSuccessMsg('Account created successfully! Please log in.');

            // Alert ekak pennawa - user ta confirm wenawa
            Alert.alert(
                'Success! 🎉',
                'Your account has been created successfully. Please log in to continue.',
                [
                    {
                        text: 'Go to Login',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );

        } catch (error) {
            // 9. Network error awoth
            console.error('Register Error:', error);
            setErrorMsg('Unable to connect to the server. Please check your network connection.');
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================================
    // UI
    // =====================================================
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: COLORS.background }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* ---- Logo / Brand ---- */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="fast-food" size={34} color="#FFFFFF" />
                        </View>
                        <Text style={styles.appName}>QuickBite</Text>
                        <Text style={styles.appTagline}>Join us today! 🍔</Text>
                    </View>

                    {/* ---- Form Card ---- */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Create Account</Text>
                        <Text style={styles.formSubtitle}>Fill in the details below to create a new account.</Text>

                        {/* ---- Error Message ---- */}
                        {errorMsg !== '' && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        )}

                        {/* ---- Success Message ---- */}
                        {successMsg !== '' && (
                            <View style={styles.successBox}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                                <Text style={styles.successText}>{successMsg}</Text>
                            </View>
                        )}

                        {/* ---- Name Input ---- */}
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'name' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color={focusedInput === 'name' ? COLORS.accent : COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={COLORS.textSecondary}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words" // Naman capital letter eken start wenawa
                                onFocus={() => setFocusedInput('name')}
                                onBlur={() => setFocusedInput('')}
                            />
                        </View>

                        {/* ---- Email Input ---- */}
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'email' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={focusedInput === 'email' ? COLORS.accent : COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor={COLORS.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
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
                                placeholder="Password (min. 6 characters)"
                                placeholderTextColor={COLORS.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput('')}
                            />
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

                        {/* ---- Confirm Password Input ---- */}
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'confirmPw' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color={focusedInput === 'confirmPw' ? COLORS.accent : COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor={COLORS.textSecondary}
                                value={confirmPw}
                                onChangeText={setConfirmPw}
                                secureTextEntry={!showConfirmPw}
                                onFocus={() => setFocusedInput('confirmPw')}
                                onBlur={() => setFocusedInput('')}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPw(!showConfirmPw)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* ---- Phone Input ---- */}
                        {/* Sri Lanka mobile number — 07XXXXXXXX wage 10 digits (optional) */}
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'phone' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons
                                name="call-outline"
                                size={20}
                                color={focusedInput === 'phone' ? COLORS.accent : COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number (e.g. 0712345678)"
                                placeholderTextColor={COLORS.textSecondary}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="numeric"
                                maxLength={10}
                                onFocus={() => setFocusedInput('phone')}
                                onBlur={() => setFocusedInput('')}
                            />
                        </View>

                        {/* ---- Role Selector ---- */}
                        {/* ROLES array eka .map() kara 3 card buttons render karanawa */}
                        <Text style={styles.roleSectionLabel}>Select Your Role</Text>
                        <View style={styles.roleRow}>
                            {ROLES.map((item) => {
                                const isSelected = role === item.value; // Me card eka select da?
                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[
                                            styles.roleCard,
                                            isSelected && styles.roleCardSelected // Selected nam emerald tint
                                        ]}
                                        onPress={() => setRole(item.value)} // Tap karanakotat role set wenawa
                                        activeOpacity={0.75}
                                    >
                                        <Ionicons
                                            name={item.icon}
                                            size={24}
                                            color={isSelected ? COLORS.accent : COLORS.textSecondary}
                                        />
                                        <Text style={[
                                            styles.roleCardText,
                                            isSelected && styles.roleCardTextSelected
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* ---- Register Button ---- */}
                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* ---- Login Link ---- */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.replace('/login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>

                    </View>{/* End Form Card */}
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}
