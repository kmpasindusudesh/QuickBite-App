// =====================================================
// RestaurantDetailScreen
// Udin restaurant eke details pennala, yatin e kade kama tika vitharak filter karala pennanawa.
// Master-Detail pattern — Home eken restaurant tap karala me screen ekata enawa.
// =====================================================
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getUser, getToken, getCart, saveCart } from '../../utils/storage';
import styles, { COLORS } from '../css/RestaurantDetailScreenStyles';

export default function RestaurantDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Home eken pass wena restaurant data — id hari _id hari (Expo Router string[] unath handle karanawa)
    const rawRestParam = params.id || params._id;
    const restId =
        rawRestParam != null && rawRestParam !== ''
            ? String(Array.isArray(rawRestParam) ? rawRestParam[0] : rawRestParam)
            : '';
    const restName = params.name ? String(params.name) : '';
    const restAddress = params.address ? String(params.address) : '';
    const restHours = params.workingHours ? String(params.workingHours) : '';
    const restLogo = params.logo ? String(params.logo) : '';

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    // Hero image URL
    const imageUrl = restLogo ? (restLogo.startsWith('http') ? restLogo : SERVER_URL + '/' + String(restLogo).replace(/^\//, '')) : null;

    useEffect(() => {
        loadFoods();
    }, [restId]);

    useEffect(() => {
        (async () => {
            const u = await getUser();
            setUserRole(u?.role ?? null);
        })();
    }, []);

    // GET /api/food — okkoma foods arahala me restaurant ekata filter karanawa frontend eken
    const loadFoods = () => {
        if (!restId) {
            setFoods([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        fetch(`${API_BASE_URL}/food`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                // Param name id hari _id — rende string widihata normalize karanawa
                const passedRestaurantId = params.id || params._id;
                const normalizedPass =
                    passedRestaurantId != null && passedRestaurantId !== ''
                        ? String(Array.isArray(passedRestaurantId) ? passedRestaurantId[0] : passedRestaurantId)
                        : '';

                // String karala ID eka check kala, ethakota wena kade kama mekata enne na.
                const filteredFoods = list.filter((food) => {
                    const foodRestId = food.restaurantId?._id || food.restaurantId;
                    return String(foodRestId) === String(normalizedPass);
                });
                setFoods(filteredFoods);
            })
            .catch((err) => {
                console.error('Foods load error:', err.message);
                setFoods([]);
            })
            .finally(() => setLoading(false));
    };

    const isManager = userRole === 'manager';

    // =====================================================
    // handleAddToCart — food item ekak cart ekata add karanawa
    // AsyncStorage eke @cart_items array eka update karanawa
    // Same item thibboth quantity++ ; naththam nawa item ekak add karanawa
    // =====================================================
    const handleAddToCart = async (item) => {
        try {
            const cart = await getCart();
            const existingIndex = cart.findIndex((c) => String(c.foodId) === String(item._id));

            if (existingIndex >= 0) {
                // Already cart eke thiyenawa — quantity eka wada karanawa
                cart[existingIndex].quantity += 1;
            } else {
                // Aluth item ekak — quantity 1 eken start karanawa
                cart.push({
                    foodId:       String(item._id),
                    name:         item.name || '',
                    price:        Number(item.price) || 0,
                    image:        item.image || '',
                    restaurantId: restId,
                    quantity:     1,
                });
            }

            await saveCart(cart);
            Alert.alert('Added to Cart', `"${item.name}" has been added to your cart. 🛒`);
        } catch (e) {
            console.error('Add to cart error:', e);
            Alert.alert('Error', 'Failed to add item to cart. Please try again.');
        }
    };

    // Food card tap — FoodDetailScreen ekata navigate karanawa
    const handleOpenDetail = (item) => {
        const restObj = item.restaurantId && typeof item.restaurantId === 'object'
            ? item.restaurantId : null;
        router.push({
            pathname: '/food-detail',
            params: {
                id: String(item._id),
                name: String(item.name ?? ''),
                price: String(item.price ?? ''),
                description: String(item.description ?? ''),
                image: String(item.image ?? ''),
                category: String(item.category ?? ''),
                restaurantId: restObj ? String(restObj._id) : restId,
                restaurantName: restObj?.name || restName,
            },
        });
    };

    // Manager — edit food
    const handleEditFood = (item) => {
        const rid = item.restaurantId && typeof item.restaurantId === 'object'
            ? item.restaurantId._id : item.restaurantId;
        router.push({
            pathname: '/edit-food',
            params: {
                id: String(item._id),
                name: String(item.name ?? ''),
                price: String(item.price ?? ''),
                description: String(item.description ?? ''),
                image: String(item.image ?? ''),
                category: String(item.category ?? 'Other'),
                restaurantId: rid ? String(rid) : '',
            },
        });
    };

    // Manager — delete food
    const handleDeleteFood = (item) => {
        Alert.alert(
            'Delete Food Item',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            if (!token) {
                                Alert.alert('Login Required', 'Please log in to perform this action.');
                                return;
                            }
                            const res = await fetch(`${API_BASE_URL}/food/${item._id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const body = await res.json().catch(() => ({}));
                            if (!res.ok) {
                                Alert.alert('Error', body.message || 'Failed to delete food item. Please try again.');
                                return;
                            }
                            setFoods((prev) => prev.filter((f) => f._id !== item._id));
                                Alert.alert('Success', body.message || 'Food item deleted successfully.');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', e?.message || 'Network error');
                        }
                    },
                },
            ]
        );
    };

    // ---- Header (hero + info) ---- rendered as FlatList header for single-scroll
    const ListHeader = () => (
        <View>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.heroImage} />
            ) : (
                <View style={styles.heroPlaceholder}>
                    <Ionicons name="storefront-outline" size={64} color={COLORS.textSecondary} />
                </View>
            )}

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <Text style={styles.restName}>{restName}</Text>

                {restAddress !== '' && (
                    <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={15} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{restAddress}</Text>
                    </View>
                )}
                {restHours !== '' && (
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={15} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{restHours}</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Menu</Text>

            {loading && (
                <ActivityIndicator size="large" color={COLORS.accent} style={{ marginVertical: 24 }} />
            )}
        </View>
    );

    // Single food card
    const renderFoodCard = ({ item }) => {
        const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : SERVER_URL + '/' + String(item.image).replace(/^\//, '')) : null;

        return (
            <TouchableOpacity
                style={styles.foodCard}
                onPress={() => handleOpenDetail(item)}
                activeOpacity={0.88}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.foodImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.foodImage, styles.foodImagePlaceholder]}>
                        <Ionicons name="fast-food-outline" size={28} color={COLORS.textSecondary} />
                    </View>
                )}

                <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.foodCategory}>{item.category}</Text>

                    <View style={styles.foodPriceRow}>
                        <Text style={styles.foodPrice}>LKR {item.price}</Text>
                        {/* Customer ta Add to Cart, Manager ta View button */}
                        {isManager ? (
                            <View style={styles.viewBtn}>
                                <Text style={styles.viewBtnText}>View</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addCartBtn}
                                onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleAddToCart(item);
                                }}
                                activeOpacity={0.8}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                                <Ionicons name="cart-outline" size={14} color="#FFF" />
                                <Text style={styles.addCartBtnText}>Add</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {isManager && (
                        <View style={styles.managerRow}>
                            <TouchableOpacity
                                onPress={() => handleEditFood(item)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDeleteFood(item)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <FlatList
                data={loading ? [] : foods}
                keyExtractor={(item) => String(item._id)}
                renderItem={renderFoodCard}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>No menu items available for this restaurant yet.</Text>
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
}
