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
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getToken, getUser } from '../../utils/storage';
import styles, { COLORS } from '../css/AddFoodScreenStyles';

// =====================================================
// Category list — Add Food screen eke thiyena eki list eka
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

function normalizeRestaurantsResponse(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.restaurants)) return data.restaurants;
    return [];
}

function restaurantRowId(r) {
    if (!r || r._id == null) return '';
    return String(r._id);
}

// Home screen eken ena params string widihata — pre-fill state ekata danna one
export default function EditFoodScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const foodId = params.id ? String(params.id) : '';

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Burger');

    // Kalin thibba server image path — 'uploads/food-xxx.jpg' (params.image)
    const [existingImagePath, setExistingImagePath] = useState('');
    // User eka aluth photo ekak pick karapu local URI (naththam null — server image eka thamai use wenawa)
    const [newImageUri, setNewImageUri] = useState(null);

    const [categoryModal, setCategoryModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);

    const [isManager, setIsManager] = useState(true);
    const [paramsReady, setParamsReady] = useState(false);

    // =====================================================
    // useEffect — route params eken form eka pre-fill karanawa (Member 3 edit flow)
    // Me data tika Home eken FlatList item eken stringify kara pass wenawa
    // =====================================================
    useEffect(() => {
        if (!foodId) {
            setParamsReady(true);
            return;
        }
        setName(String(params.name ?? ''));
        setPrice(String(params.price ?? ''));
        setDescription(String(params.description ?? ''));
        const cat = String(params.category || 'Other');
        setCategory(FOOD_CATEGORIES.includes(cat) ? cat : 'Other');
        setExistingImagePath(String(params.image ?? '').trim());
        const rid = params.restaurantId ? String(params.restaurantId) : '';
        if (rid) setSelectedRestaurant(rid);
        setParamsReady(true);
    }, [foodId, params.name, params.price, params.description, params.category, params.image, params.restaurantId]);

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
    // Restaurant list eka server eken ganna thana (Edit Food screen)
    // Simple .then() fetch — token naha (public route)
    // =====================================================
    useEffect(() => {
        setLoadingRestaurants(true);

        // Simple fetch chain
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
                console.log('Fetched Restaurants (EditFood):', data);

                const rawList = normalizeRestaurantsResponse(data);
                const list = rawList.filter((r) => restaurantRowId(r) !== '');
                setRestaurants(list);

                const fromParam = params.restaurantId ? String(params.restaurantId) : '';
                if (fromParam && list.some((r) => restaurantRowId(r) === fromParam)) {
                    setSelectedRestaurant(fromParam);
                } else if (list.length > 0) {
                    setSelectedRestaurant(restaurantRowId(list[0]));
                }
            })
            .catch(err => {
                console.error('Restaurants fetch error (EditFood):', err.message);
                setRestaurants([]);
            })
            .finally(() => setLoadingRestaurants(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.restaurantId]);

    // Server eken thiyena image eka pennanna URL hadanawa
    const imageUrl = useMemo(() => {
        return existingImagePath ? (existingImagePath.startsWith('http') ? existingImagePath : SERVER_URL + '/' + String(existingImagePath).replace(/^\//, '')) : null;
    }, [existingImagePath]);

    // =====================================================
    // pickFoodImage — aluth photo ekak pick karapu nam PUT eken multer eken replace wenawa
    // =====================================================
    const pickFoodImage = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.85,
            });
            if (result.canceled || !result.assets?.[0]) return;
            setNewImageUri(result.assets[0].uri);
            setErrorMsg('');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to select photo. Please try again.');
        }
    };

    // =====================================================
    // handleSubmit — PUT /api/food/:id — FormData eken existing record eka update karanawa
    // JWT + Manager witharak witharak backend eken allow wenawa (foodRoutes.js protect + onlyManager)
    // Content-Type manual danna epa — FormData boundary auto
    // =====================================================
    const handleSubmit = async () => {
        setErrorMsg('');
        if (!foodId) {
            setErrorMsg('Food ID not found. Please try editing from the Home screen.');
            return;
        }

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

        if (restaurants.length === 0) {
            Alert.alert('Validation', 'Please add a restaurant first');
            setErrorMsg('Please add a restaurant first');
            return;
        }
        if (!selectedRestaurant) {
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
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('price', String(priceNum));
            formData.append('category', category);
            formData.append('restaurantId', selectedRestaurant);

            // Aluth image ekak witharak append — naththam backend eka existing image path eka keep karanawa
            if (newImageUri) {
                const fileName = newImageUri.split('/').pop() || 'food.jpg';
                const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('image', {
                    uri: newImageUri,
                    name: fileName,
                    type: mimeType,
                });
            }

            const response = await fetch(`${API_BASE_URL}/food/${foodId}`, {
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

            Alert.alert('Success', data.message || 'Food item updated successfully.', [
                { text: 'OK', onPress: () => router.push('/home') },
            ]);
        } catch (e) {
            console.error(e);
            setErrorMsg(e?.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    if (paramsReady && !foodId) {
        return (
            <View style={[styles.container, { justifyContent: 'center', padding: 24 }]}>
                <Text style={{ color: COLORS.error, textAlign: 'center' }}>Food ID not found. Please navigate from the Home screen to edit.</Text>
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
                    nestedScrollEnabled
                >
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/home')}>
                            <Ionicons name="arrow-back" size={26} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.screenTitle}>Edit Food</Text>
                                <Text style={styles.screenSubtitle}>Update the details of this menu item</Text>
                        </View>
                    </View>

                    {!isManager && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                This screen is for Managers only. Other roles will receive a 403 error.
                            </Text>
                        </View>
                    )}

                    {errorMsg !== '' && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                    )}

                    {!loadingRestaurants && restaurants.length === 0 && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>Please add a restaurant first</Text>
                        </View>
                    )}

                    <Text style={styles.label}>Select Restaurant</Text>
                    {loadingRestaurants ? (
                        <View style={styles.pickerLoadingRow}>
                            <ActivityIndicator color={COLORS.accent} />
                            <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Loading restaurants...</Text>
                        </View>
                    ) : (
                        <View style={styles.pickerWrapper}>
                            {/* Database eke thiyena okkoma restaurants meken map karala pennanawa. */}
                            <Picker
                                selectedValue={selectedRestaurant}
                                onValueChange={(v) => setSelectedRestaurant(String(v))}
                                style={styles.picker}
                                dropdownIconColor={COLORS.accent}
                                mode="dropdown"
                                enabled={restaurants.length > 0}
                            >
                                {restaurants.length === 0 ? (
                                    <Picker.Item label="— No restaurants —" value="" color={COLORS.textSecondary} />
                                ) : (
                                    restaurants.map((rest, idx) => (
                                        <Picker.Item
                                            key={`${restaurantRowId(rest)}-${idx}`}
                                            label={rest.name || 'Unnamed'}
                                            value={restaurantRowId(rest)}
                                            color={COLORS.textPrimary}
                                        />
                                    ))
                                )}
                            </Picker>
                        </View>
                    )}

                    <Text style={styles.label}>Food Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Food name"
                        placeholderTextColor={COLORS.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Price (LKR)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Price"
                        placeholderTextColor={COLORS.textSecondary}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                    />

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
                        placeholder="Description..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={styles.label}>Food Photo</Text>
                    <View style={styles.imagePreviewBox}>
                        {newImageUri ? (
                            <Image source={{ uri: newImageUri }} style={styles.previewImage} resizeMode="cover" />
                        ) : imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={48} color={COLORS.textSecondary} />
                                <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>No photo — you can select a new one below</Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity style={styles.pickImageBtn} onPress={pickFoodImage} activeOpacity={0.85}>
                        <Ionicons name="images-outline" size={22} color={COLORS.accent} />
                        <Text style={styles.pickImageBtnText}>Change Photo (optional)</Text>
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

            <Modal visible={categoryModal} transparent animationType="slide" onRequestClose={() => setCategoryModal(false)}>
                <View style={styles.modalOverlay}>
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

/*
 * Mul sangrahaya (Sinhala):
 * Home eken pass karana params eken form eka pre-fill wenawa — PUT /food/:id eken update karanawa.
 * Manager naththam backend 403 denawa. fetch + FormData witharak — Redux/Axios naha.
 */
