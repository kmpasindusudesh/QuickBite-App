import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getToken, getUser } from '../../utils/storage';
import styles, { COLORS } from '../css/AddRestaurantScreenStyles';

// =====================================================
// AddRestaurantScreen — Member 2: Restaurant Add + Manage (inline)
// Top: Add / Edit form     Bottom: Existing restaurant list
// =====================================================
export default function AddRestaurantScreen() {
    const router = useRouter();

    // ---- Form state ----
    const [name, setName]               = useState('');
    const [address, setAddress]         = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [logoUri, setLogoUri]         = useState(null);   // new local image
    const [submitting, setSubmitting]   = useState(false);
    const [errorMsg, setErrorMsg]       = useState('');

    // ---- Edit mode — null = create, id string = update ----
    const [editingId, setEditingId]     = useState(null);

    // Manager naththam me screen use karanna ba
    const [isManager, setIsManager]     = useState(true);

    // =====================================================
    // Form eka yatin okkoma restaurants tika list ekakata gaththa
    // GET /api/restaurants — public, token naha
    // =====================================================
    const [restaurants, setRestaurants]   = useState([]);
    const [loadingList, setLoadingList]   = useState(true);

    // ---- Load user role ----
    useEffect(() => {
        (async () => {
            const u = await getUser();
            if (u && u.role !== 'manager') setIsManager(false);
        })();
    }, []);

    // =====================================================
    // loadRestaurants — server eken restaurant list gannawa
    // =====================================================
    const loadRestaurants = useCallback(() => {
        setLoadingList(true);
        fetch(`${API_BASE_URL}/restaurants`)
            .then(res => res.json())
            .then(data => {
                setRestaurants(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error('Restaurants load error:', err.message);
                setRestaurants([]);
            })
            .finally(() => setLoadingList(false));
    }, []);

    // Screen focus wenakotat list refresh karanawa
    useFocusEffect(
        useCallback(() => {
            loadRestaurants();
        }, [loadRestaurants])
    );

    // =====================================================
    // pickLogoImage — Gallery eken logo select karana hati
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
            setLogoUri(result.assets[0].uri);
            setErrorMsg('');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to select logo. Please try again.');
        }
    };

    // =====================================================
    // resetForm — form eka blank karanna saha edit mode off karanawa
    // =====================================================
    const resetForm = () => {
        setEditingId(null);
        setName('');
        setAddress('');
        setWorkingHours('');
        setLogoUri(null);
        setErrorMsg('');
    };

    // =====================================================
    // handleEditPress — Edit click kalama form ekata data tika enna haduwa
    // restaurant eke data tika form fields ekata load karanawa
    // =====================================================
    const handleEditPress = (item) => {
        setEditingId(String(item._id));
        setName(item.name || '');
        setAddress(item.address || '');
        setWorkingHours(item.workingHours || '');
        setLogoUri(null); // New logo pick karanna puluwan — naththam server eke eka keep
        setErrorMsg('');
    };

    // =====================================================
    // handleDelete — Delete karanna kalin kama thiyenawada balana safety eka damma
    // Alert confirm → DELETE /api/restaurants/:id + JWT
    // Backend: linkedFood thiyenawa nam 400 return karanawa
    // =====================================================
    const handleDelete = (item) => {
        Alert.alert(
            'Delete Restaurant',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            if (!token) return;
                            const res = await fetch(`${API_BASE_URL}/restaurants/${item._id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                                Alert.alert('Delete Failed', data.message || `Error ${res.status}`);
                                return;
                            }
                            // UI update — deleted item list eken remove karanawa
                            setRestaurants(prev => prev.filter(r => r._id !== item._id));
                            // Editing id eka me delete karana eka nam form reset karanawa
                            if (editingId === String(item._id)) resetForm();
                            Alert.alert('Deleted', data.message || 'Restaurant deleted successfully.');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', e?.message || 'Network error');
                        }
                    },
                },
            ]
        );
    };

    // =====================================================
    // handleSubmit — Add (POST) hari Edit (PUT) submit karanawa
    // editingId thibboth PUT — naththam POST
    // =====================================================
    const handleSubmit = async () => {
        setErrorMsg('');

        // Blank check
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

            // Logo — new one pick karapu naththam append; naththam server eke eka keep wenawa
            if (logoUri) {
                const fileName = logoUri.split('/').pop() || 'logo.jpg';
                const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('logo', { uri: logoUri, name: fileName, type: mimeType });
            }

            const isEdit   = editingId !== null;
            const url      = isEdit
                ? `${API_BASE_URL}/restaurants/${editingId}`
                : `${API_BASE_URL}/restaurants`;
            const method   = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
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

            Alert.alert(
                'Success',
                data.message || (isEdit ? 'Restaurant updated successfully.' : 'Restaurant added successfully.'),
            );
            resetForm();
            loadRestaurants(); // List refresh karanawa
        } catch (e) {
            console.error(e);
            setErrorMsg(e?.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

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
                    {/* ---- Header ---- */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/profile')}>
                            <Ionicons name="arrow-back" size={26} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.screenTitle}>
                                {editingId ? 'Edit Restaurant' : 'Add Restaurant'}
                            </Text>
                            <Text style={styles.screenSubtitle}>
                                {editingId
                                    ? 'Update the restaurant details below.'
                                    : 'Fill in the details to add a new restaurant.'}
                            </Text>
                        </View>
                    </View>

                    {!isManager && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                This screen is for Manager accounts only. Other roles will receive a 403 error.
                            </Text>
                        </View>
                    )}

                    {errorMsg !== '' && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                    )}

                    {/* ======================================================
                        ADD / EDIT FORM
                        ====================================================== */}

                    <Text style={styles.label}>Restaurant Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Eg: Spice Garden"
                        placeholderTextColor={COLORS.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Enter the full address..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={address}
                        onChangeText={setAddress}
                        multiline
                    />

                    <Text style={styles.label}>Working Hours</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Eg: 8 AM - 10 PM"
                        placeholderTextColor={COLORS.textSecondary}
                        value={workingHours}
                        onChangeText={setWorkingHours}
                    />

                    <Text style={styles.label}>Logo</Text>
                    <View style={styles.imagePreviewBox}>
                        {logoUri ? (
                            <Image source={{ uri: logoUri }} style={styles.previewImage} resizeMode="cover" />
                        ) : (
                            <>
                                <Ionicons name="business-outline" size={48} color={COLORS.textSecondary} />
                                <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>
                                    {editingId ? 'Pick a new logo (optional)' : 'Select a logo image'}
                                </Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity style={styles.pickImageBtn} onPress={pickLogoImage} activeOpacity={0.85}>
                        <Ionicons name="images-outline" size={22} color={COLORS.accent} />
                        <Text style={styles.pickImageBtnText}>Choose Logo from Gallery</Text>
                    </TouchableOpacity>

                    {/* Submit / Update Button */}
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
                                <Ionicons
                                    name={editingId ? 'save-outline' : 'storefront-outline'}
                                    size={22}
                                    color="#FFF"
                                />
                                <Text style={styles.submitBtnText}>
                                    {editingId ? 'Update Restaurant' : 'Add Restaurant'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Cancel edit link */}
                    {editingId && (
                        <TouchableOpacity style={styles.cancelEditBtn} onPress={resetForm}>
                            <Text style={styles.cancelEditText}>Cancel Edit</Text>
                        </TouchableOpacity>
                    )}

                    {/* ======================================================
                        DIVIDER — form saha list etara
                        ====================================================== */}
                    <View style={styles.divider} />

                    {/* ======================================================
                        MANAGE EXISTING RESTAURANTS LIST
                        Form eka yatin okkoma restaurants tika list ekakata gaththa
                        ====================================================== */}
                    <Text style={styles.sectionTitle}>Manage Existing Restaurants</Text>

                    {loadingList ? (
                        <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
                    ) : restaurants.length === 0 ? (
                        <Text style={styles.emptyText}>No restaurants found. Add one above!</Text>
                    ) : (
                        restaurants.map((item) => {
                            const imageUrl = item.logo ? (item.logo.startsWith('http') ? item.logo : SERVER_URL + '/' + String(item.logo).replace(/^\//, '')) : null;
                            return (
                            <View
                                key={String(item._id)}
                                style={[
                                    styles.listCard,
                                    editingId === String(item._id) && styles.listCardEditing,
                                ]}
                            >
                                {/* Logo thumb */}
                                {imageUrl ? (
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.listLogoThumb}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.listLogoThumb}>
                                        <Ionicons name="storefront-outline" size={24} color={COLORS.textSecondary} />
                                    </View>
                                )}

                                {/* Name + address */}
                                <View style={styles.listCardText}>
                                    <Text style={styles.listCardName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.listCardAddress} numberOfLines={1}>
                                        {item.address || '—'}
                                    </Text>
                                </View>

                                {/* Edit + Delete action icons */}
                                <View style={styles.listCardActions}>
                                    {/* Edit click kalama form ekata data tika enna haduwa */}
                                    <TouchableOpacity
                                        style={styles.listEditBtn}
                                        onPress={() => handleEditPress(item)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                                    </TouchableOpacity>

                                    {/* Delete karanna kalin kama thiyenawada balana safety eka damma */}
                                    <TouchableOpacity
                                        style={styles.listDeleteBtn}
                                        onPress={() => handleDelete(item)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            );
                        })
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

/*
 * Mul sangrahaya (Sinhala):
 * Top: Add / Edit form — POST (add) hari PUT (edit) karanawa.
 * Edit click kalama form ekata data tika enna haduwa — editingId state eka set wenawa.
 * Delete karanna kalin kama thiyenawada balana safety eka damma — backend 400 return karanawa.
 * Form eka yatin okkoma restaurants tika list ekakata gaththa — loadRestaurants() eken.
 * fetch + useState witharak — Redux / Axios naha.
 */
