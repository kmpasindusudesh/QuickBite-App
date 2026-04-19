import React, { useState, useEffect } from 'react';
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
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL } from '../../config';
import { getToken, getUser } from '../../utils/storage';
import styles, { COLORS } from '../css/AddFoodScreenStyles';

// =====================================================
// Category list — Modal "Picker" eken select karanna puluwan options
// Backend eke category String field eka — me values save wenawa
// =====================================================
const FOOD_CATEGORIES = [
    'Burger',
    'Pizza',
    'Drinks',
    'Dessert',
    'Rice',
    'Snacks',
    'Other',
];

// GET /restaurants response — plain array hari { data: [] } hari { restaurants: [] } — okkoma array ekakata
function normalizeRestaurantsResponse(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.restaurants)) return data.restaurants;
    return [];
}

// Picker eka value ekata stable string _id — null/invalid rows drop karanawa
function restaurantRowId(r) {
    if (!r || r._id == null) return '';
    return String(r._id);
}

export default function AddFoodScreen({ embedded = false } = {}) {

    const router = useRouter();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Burger');

    // Gallery eken select karapu photo eke local URI eka
    const [imageUri, setImageUri] = useState(null);

    const [categoryModal, setCategoryModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Member 2 + 3 — GET /restaurants eken ena list eka (custom dropdown eke pennanna)
    const [restaurants, setRestaurants] = useState([]);
    // Select karapu restaurant eke MongoDB _id — FormData eken restaurantId yawanawa
    const [restaurantId, setRestaurantId] = useState('');
    // Dropdown eka open/close karana state eka.
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // Restaurants load wenakotat spinner pennanna
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);

    // AsyncStorage eken user role eka — Manager naththam warning pennawa
    const [isManager, setIsManager] = useState(true);

    useEffect(() => {
        const loadRole = async () => {
            const u = await getUser();
            if (u && u.role !== 'manager') {
                setIsManager(false);
            }
        };
        loadRole();
    }, []);

    // =====================================================
    // fetchRestaurants — GET /restaurants eken okkoma list eka — setRestaurants(list) eka one shot
    // =====================================================
    const fetchRestaurants = () => {
        setLoadingRestaurants(true);

        fetch(`${API_BASE_URL}/restaurants`)
            .then((res) => {
                if (!res.ok) {
                    return res
                        .json()
                        .catch(() => ({}))
                        .then((body) => {
                            throw new Error(body?.message || `HTTP ${res.status}`);
                        });
                }
                return res.json();
            })
            .then((data) => {
                console.log('Fetched Restaurants:', data);
                // Frontend eka array enakotat data.length — wrapped nam undefined (normalize balanna)
                console.log('Restaurant Array Length:', data.length);

                const rawList = normalizeRestaurantsResponse(data);
                const list = rawList.filter((r) => restaurantRowId(r) !== '');
                // Okkoma array eka one time set — overwrite loop naha
                setRestaurants(list);
                // Auto-select naha — user eka dropdown eken restaurant ekak select karanawa
                if (list.length === 0) {
                    setRestaurantId('');
                }
            })
            .catch((err) => {
                console.error('Restaurants fetch error:', err.message);
                setRestaurants([]);
                setRestaurantId('');
            })
            .finally(() => setLoadingRestaurants(false));
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    // =====================================================
    // pickFoodImage — Gallery eken food photo ekak select karanna
    // =====================================================
    const pickFoodImage = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // මෙතන MediaTypeOptions වෙනුවට MediaType විතරක් දාන්න
                allowsEditing: true,
                aspect: [4, 3], // Food photo ekata rectangular shape
                quality: 0.85,
            });

            if (result.canceled || !result.assets?.[0]) return;

            setImageUri(result.assets[0].uri);
            setErrorMsg('');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to select photo. Please try again.');
        }
    };

    // =====================================================
    // handleSubmit — FormData eken POST /api/food/add
    // Field name 'image' — multer eke .single('image') ekata match
    // =====================================================
    const handleSubmit = async () => {
        setErrorMsg('');

        // Empty records database ekata yanna naha — field by field check + Alert
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter the food item name.');
            return;
        }
        if (!price.trim()) {
            Alert.alert('Validation', 'Please enter a price for this item.');
            return;
        }
        if (!category) {
            Alert.alert('Validation', 'Please select a category.');
            return;
        }

        // Negative pricing saha zero price database ekata yanna naha
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum <= 0) {
            Alert.alert('Validation', 'Please enter a valid price');
            return;
        }

        // Restaurant naththam food add karanna ba — Member 2 ekata add karanna ona
        if (restaurants.length === 0) {
            Alert.alert('Validation', 'Please add a restaurant first');
            setErrorMsg('Please add a restaurant first');
            return;
        }
        if (!restaurantId) {
            Alert.alert('Validation', 'Please select a restaurant.');
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

            // Text fields — multipart body eken server eka req.body eken genawa
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('price', String(priceNum));
            formData.append('category', category);
            // Member 3 — Food eka Member 2 restaurant ekata link — backend eke restaurantId field eka
            formData.append('restaurantId', restaurantId);

            // Image eka thiyanam witharak append karanawa — naththam backend eke image empty
            if (imageUri) {
                const fileName = imageUri.split('/').pop() || 'food.jpg';
                const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

                formData.append('image', {
                    uri: imageUri,
                    name: fileName,
                    type: mimeType,
                });
            }

            // POST /api/food/add — Manager JWT ona
            // Content-Type manual danna epa — FormData + boundary auto
            const response = await fetch(`${API_BASE_URL}/food/add`, {
                method: 'POST',
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

            Alert.alert('Success', data.message || 'Food item added successfully.', [
                { text: 'OK', onPress: () => router.push('/profile') },
            ]);
        } catch (e) {
            console.error(e);
            setErrorMsg(e?.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedRestaurantRow = restaurants.find((r) => String(r._id) === String(restaurantId));
    const restaurantDropdownMainLabel = selectedRestaurantRow?.name || 'Select a Restaurant...';
    const showRestaurantPlaceholder = !restaurantId || !selectedRestaurantRow;

    return (
        <>
            {!embedded && (
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            )}

            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: COLORS.background }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={[
                        styles.scrollContent,
                        embedded && styles.scrollContentEmbedded,
                    ]}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                >

                    {!embedded && (
                        <View style={styles.headerRow}>
                            {/* Back button — Profile tab ekata yawanawa (role-based tab layout ekata match) */}
                            <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/profile')}>
                                <Ionicons name="arrow-back" size={26} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.screenTitle}>Add Food</Text>
                                <Text style={styles.screenSubtitle}>Add a new item to your menu</Text>
                            </View>
                        </View>
                    )}

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

                    {/* Restaurant list nadda — Add Restaurant screen ekata yanna reminder */}
                    {!loadingRestaurants && restaurants.length === 0 && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>Please add a restaurant first</Text>
                        </View>
                    )}

                    {/* iOS wala ena katha native roda picker eka amathaka kara, simple custom dropdown ekak haduwa. */}
                    <Text style={styles.label}>Select Restaurant</Text>
                    {loadingRestaurants ? (
                        <View style={styles.pickerLoadingRow}>
                            <ActivityIndicator color={COLORS.accent} />
                            <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Loading restaurants...</Text>
                        </View>
                    ) : (
                        <View style={{ marginBottom: 16 }}>
                            <TouchableOpacity
                                style={styles.restaurantDropdownBtn}
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                activeOpacity={0.85}
                                disabled={restaurants.length === 0}
                            >
                                <Text
                                    style={[
                                        styles.restaurantDropdownBtnText,
                                        showRestaurantPlaceholder && { color: COLORS.textSecondary },
                                    ]}
                                >
                                    {restaurantDropdownMainLabel}
                                </Text>
                                <Ionicons
                                    name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                    size={22}
                                    color={COLORS.accent}
                                />
                            </TouchableOpacity>

                            {isDropdownOpen && restaurants.length > 0 && (
                                <View style={styles.restaurantDropdownList}>
                                    <ScrollView
                                        nestedScrollEnabled
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        {restaurants.map((rest, index) => (
                                            <TouchableOpacity
                                                key={String(rest._id ?? index)}
                                                style={styles.restaurantDropdownItem}
                                                activeOpacity={0.75}
                                                onPress={() => {
                                                    setRestaurantId(String(rest._id));
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <Text style={styles.restaurantDropdownItemText}>
                                                    {rest.name || 'No Name'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}

                    <Text style={styles.label}>Food Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Eg: Cheese Burger"
                        placeholderTextColor={COLORS.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Price (LKR)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Eg: 850"
                        placeholderTextColor={COLORS.textSecondary}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                    />

                    {/* Category — Picker wage Modal eken select karanawa */}
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.categoryField}
                        onPress={() => setCategoryModal(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.categoryFieldText}>{category}</Text>
                        <Ionicons name="chevron-down" size={22} color={COLORS.accent} />
                    </TouchableOpacity>

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Enter a description for this food item..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={styles.label}>Food Photo</Text>
                    <View style={styles.imagePreviewBox}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={48} color={COLORS.textSecondary} />
                                <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Tap to select a photo</Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity style={styles.pickImageBtn} onPress={pickFoodImage} activeOpacity={0.85}>
                        <Ionicons name="images-outline" size={22} color={COLORS.accent} />
                        <Text style={styles.pickImageBtnText}>Choose Photo from Gallery</Text>
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
                                <Ionicons name="cloud-upload-outline" size={22} color="#FFF" />
                                <Text style={styles.submitBtnText}>Add Food</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category Picker Modal — Picker wage category list eka */}
            <Modal visible={categoryModal} transparent animationType="slide" onRequestClose={() => setCategoryModal(false)}>
                <View style={styles.modalOverlay}>
                    {/* Uda area eka tap karakotat modal close — flex 1 */}
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setCategoryModal(false)} activeOpacity={1} />
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>Select a Category</Text>
                        <ScrollView>
                            {FOOD_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setCategory(cat);
                                        setCategoryModal(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.categoryOptionText,
                                            category === cat && styles.categoryOptionSelected,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}
