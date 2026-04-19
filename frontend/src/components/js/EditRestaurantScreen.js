import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getToken, getUser } from '../../utils/storage';
import styles, { COLORS } from '../css/AddRestaurantScreenStyles';

// =====================================================
// EditRestaurantScreen — Member 2: PUT /restaurants/:id — FormData + JWT
// =====================================================
export default function EditRestaurantScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const restaurantId = params.id ? String(params.id) : '';

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [existingLogoPath, setExistingLogoPath] = useState('');
    const [newLogoUri, setNewLogoUri] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isManager, setIsManager] = useState(true);
    const [paramsReady, setParamsReady] = useState(false);

    // =====================================================
    // Route params eken form pre-fill — Home/Manage list eken string widihata enawa
    // =====================================================
    useEffect(() => {
        if (!restaurantId) {
            setParamsReady(true);
            return;
        }
        setName(String(params.name ?? ''));
        setAddress(String(params.address ?? ''));
        setWorkingHours(String(params.workingHours ?? ''));
        setExistingLogoPath(String(params.logo ?? '').trim());
        setParamsReady(true);
    }, [restaurantId, params.name, params.address, params.workingHours, params.logo]);

    useEffect(() => {
        (async () => {
            const u = await getUser();
            if (u && u.role !== 'manager') setIsManager(false);
        })();
    }, []);

    const imageUrl = useMemo(() => {
        return existingLogoPath ? (existingLogoPath.startsWith('http') ? existingLogoPath : SERVER_URL + '/' + String(existingLogoPath).replace(/^\//, '')) : null;
    }, [existingLogoPath]);

    // =====================================================
    // pickLogoImage — aluth logo ekak pick karapu nam PUT FormData eken yawanawa
    // =====================================================
    const pickLogoImage = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (result.canceled || !result.assets?.[0]) return;
            setNewLogoUri(result.assets[0].uri);
            setErrorMsg('');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to select logo. Please try again.');
        }
    };

    // =====================================================
    // handleSubmit — PUT request — FormData eken name/address/workingHours + optional logo
    // Backend eka multer eken 'logo' field eka read karanawa — JWT + Manager ona
    // Content-Type manual danna epa — FormData boundary auto
    // =====================================================
    const handleSubmit = async () => {
        setErrorMsg('');
        if (!restaurantId) {
            setErrorMsg('Restaurant ID not found.');
            return;
        }

        // Empty records database ekata yanna naha — field by field check + Alert
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter the restaurant name.');
            return;
        }
        if (!address.trim()) {
            Alert.alert('Validation', 'Please enter the restaurant address.');
            return;
        }

        setSubmitting(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Login Required', 'You must be logged in to perform this action.');
                router.replace('/login');
                return;
            }

            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('address', address.trim());
            formData.append('workingHours', workingHours.trim());

            if (newLogoUri) {
                const fileName = newLogoUri.split('/').pop() || 'logo.jpg';
                const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('logo', {
                    uri: newLogoUri,
                    name: fileName,
                    type: mimeType,
                });
            }

            // PUT /api/restaurants/:id — update existing restaurant — Bearer token header eken
            const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrorMsg(data.message || `Error ${response.status}`);
                if (response.status === 403) {
                    Alert.alert('Access Denied', data.message || 'Only managers are allowed to perform this action.');
                }
                return;
            }

            Alert.alert('Success', data.message || 'Restaurant updated successfully.', [
                { text: 'OK', onPress: () => router.push('/manage-restaurants') },
            ]);
        } catch (e) {
            console.error(e);
            setErrorMsg(e?.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    if (paramsReady && !restaurantId) {
        return (
            <View style={[styles.container, { flex: 1, justifyContent: 'center', padding: 24 }]}>
                <Text style={{ color: COLORS.error, textAlign: 'center' }}>Restaurant ID not found.</Text>
                <TouchableOpacity style={[styles.submitBtn, { marginTop: 20 }]} onPress={() => router.back()}>
                    <Text style={styles.submitBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: COLORS.background }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/manage-restaurants')}>
                            <Ionicons name="arrow-back" size={26} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.screenTitle}>Edit Restaurant</Text>
                                <Text style={styles.screenSubtitle}>Update the restaurant details. Logo change is optional.</Text>
                        </View>
                    </View>

                    {!isManager && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>This screen is for Managers only. Other roles will receive a 403 error.</Text>
                        </View>
                    )}

                    {errorMsg !== '' && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                    )}

                    <Text style={styles.label}>Restaurant Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor={COLORS.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Address"
                        placeholderTextColor={COLORS.textSecondary}
                        value={address}
                        onChangeText={setAddress}
                        multiline
                    />

                    <Text style={styles.label}>Working Hours</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Eg: 8 AM - 10 PM'
                        placeholderTextColor={COLORS.textSecondary}
                        value={workingHours}
                        onChangeText={setWorkingHours}
                    />

                    <Text style={styles.label}>Logo</Text>
                    <View style={styles.imagePreviewBox}>
                        {newLogoUri ? (
                            <Image source={{ uri: newLogoUri }} style={styles.previewImage} resizeMode="cover" />
                        ) : imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                        ) : (
                            <>
                                <Ionicons name="business-outline" size={48} color={COLORS.textSecondary} />
                                <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>No logo uploaded</Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity style={styles.pickImageBtn} onPress={pickLogoImage} activeOpacity={0.85}>
                        <Ionicons name="images-outline" size={22} color={COLORS.accent} />
                        <Text style={styles.pickImageBtnText}>Change Logo (optional)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.9}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={22} color="#FFF" />
                                <Text style={styles.submitBtnText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

/*
 * Mul sangrahaya (Sinhala):
 * PUT eken restaurant update karanawa — FormData + JWT. Aluth logo nadda server eka
 * kalin path eka keep karanawa. fetch witharak beginner-friendly.
 */
