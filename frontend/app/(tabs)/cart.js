// =====================================================
// cart.js — Cart Tab Screen (Expo Router wrapper)
// Member 4: Customer Cart & Checkout UI
//
// Cart data → AsyncStorage eke save (storage.js CART_KEY)
// Checkout → POST /api/orders (FormData: items JSON + paymentSlip image)
//
// Tab visibility: Customer witharak (Manager + Rider hide → _layout.js href: null)
//
// Actual logic: src/components/js/cart.js eke
// Wait — me file IS the implementation (not a wrapper for this tab)
// =====================================================

// =====================================================
// cart.js — Member 4: Customer Cart & Checkout Full Implementation
// Kama eka phone eke local storage ekata save wela, me tab eken checkout wenawa
// AsyncStorage key: @cart_items
//
// Flow:
//   1. useFocusEffect → loadCart() — AsyncStorage eken items load
//   2. Quantity change / remove → saveCart() → AsyncStorage update
//   3. pickSlip → ImagePicker → gallery eken bank slip select
//   4. handleConfirmOrder → FormData → POST /api/orders
//   5. Success → clearCart() + router.replace('/home')
// =====================================================
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Backend URL + static file server URL
import { API_BASE_URL, SERVER_URL } from '../../src/config';

// JWT token + cart helpers (AsyncStorage)
import { getToken, getCart, saveCart, clearCart } from '../../src/utils/storage';

// Styles + COLORS (dark green theme)
import styles, { COLORS } from '../../src/components/css/CartScreenStyles';

// =====================================================
// CartScreen — Main component
// =====================================================
export default function CartScreen() {
    const router = useRouter();

    // Cart items state — each item: { foodId, name, price, image, restaurantId, quantity }
    const [cartItems, setCartItems] = useState([]);

    // Payment slip image URI — user gallery eken select karanawa
    const [slipUri, setSlipUri]     = useState(null);

    // API call loading state — Confirm Order button disable karanawa
    const [submitting, setSubmitting] = useState(false);

    // =====================================================
    // loadCart — AsyncStorage eken cart items gannawa
    // useFocusEffect — Tab focus wenakotat refresh (RestaurantDetail eken add kala passe)
    // =====================================================
    const loadCart = useCallback(async () => {
        const items = await getCart(); // storage.js eke getCart()
        setCartItems(Array.isArray(items) ? items : []);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCart(); // Tab focus wenakotat cart refresh
            setSlipUri(null); // New visit eke slip reset (pata slip pending naha)
        }, [loadCart])
    );

    // =====================================================
    // handleQuantityChange — +/- buttons walata
    // delta: +1 (add) hari -1 (remove one)
    // quantity 0 wunakotat item cart eken remove wenawa
    // =====================================================
    const handleQuantityChange = async (foodId, delta) => {
        const updated = cartItems
            .map((item) =>
                item.foodId === foodId
                    ? { ...item, quantity: item.quantity + delta } // Quantity update
                    : item
            )
            .filter((item) => item.quantity > 0); // 0 wunakotat remove
        setCartItems(updated);
        await saveCart(updated); // AsyncStorage update
    };

    // =====================================================
    // handleRemove — Trash icon press karakotat item remove
    // =====================================================
    const handleRemove = async (foodId) => {
        const updated = cartItems.filter((item) => item.foodId !== foodId);
        setCartItems(updated);
        await saveCart(updated);
    };

    // =====================================================
    // totalAmount — Cart eke total bill calculate
    // reduce() — okkoma items sum karanawa (price × quantity)
    // =====================================================
    const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    // =====================================================
    // pickSlip — Gallery eken bank slip select karanawa
    // ImagePicker.launchImageLibraryAsync — library eka open karanawa
    // Permission request → granted naththam return
    // =====================================================
    const pickSlip = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.85, // 85% quality — file size reduce
            });
            if (result.canceled || !result.assets?.[0]) return;
            setSlipUri(result.assets[0].uri); // Selected image URI set
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to select payment slip. Please try again.');
        }
    };

    // =====================================================
    // handleConfirmOrder — Order eka backend ekata yawanawa
    // FormData use karanawa — multipart (text + image same request)
    //
    // Steps:
    // 1. Cart empty check
    // 2. restaurantId check (cart items eken first item)
    // 3. JWT token gannawa
    // 4. FormData build: items JSON + totalAmount + restaurantId + optional slip
    // 5. POST /api/orders (Authorization header)
    // 6. Success → clearCart() + navigate to Home
    // =====================================================
    const handleConfirmOrder = async () => {
        // 1. Cart empty check
        if (cartItems.length === 0) {
            Alert.alert('Cart is Empty', 'Please add items to your cart before placing an order.');
            return;
        }

        // 2. RestaurantId — okkoma items eka restaurant eke
        const restaurantId = cartItems[0]?.restaurantId || '';
        if (!restaurantId) {
            Alert.alert('Error', 'Restaurant information is missing. Please add items again.');
            return;
        }

        // 3. Token check — login naththam redirect
        const token = await getToken();
        if (!token) {
            Alert.alert('Login Required', 'Please log in to place an order.');
            router.replace('/login');
            return;
        }

        setSubmitting(true); // Button disable
        try {
            // 4. FormData build
            const formData = new FormData();

            // Items JSON string → FormData multipart body walata
            const itemsPayload = cartItems.map((it) => ({
                foodId:   it.foodId,
                quantity: it.quantity,
            }));
            formData.append('items', JSON.stringify(itemsPayload));
            formData.append('totalAmount', String(totalAmount));
            formData.append('restaurantId', restaurantId);

            // Bank slip image — optional (slip select kala naththam skip)
            if (slipUri) {
                const fileName = slipUri.split('/').pop() || 'slip.jpg';
                const ext      = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mime     = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('paymentSlip', { uri: slipUri, name: fileName, type: mime });
            }

            // 5. POST /api/orders
            const res  = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                // Content-Type set karanna epa — FormData eke boundary auto set wenawa
                body: formData,
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                Alert.alert('Order Failed', data.message || `Error ${res.status}`);
                return;
            }

            // 6. Success
            await clearCart();       // AsyncStorage cart clear
            setCartItems([]);
            setSlipUri(null);

            Alert.alert('Order Placed! 🎉', data.message || 'Your order has been placed successfully!', [
                { text: 'OK', onPress: () => router.replace('/home') },
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error. Please check your connection.');
        } finally {
            setSubmitting(false); // Button re-enable
        }
    };

    // =====================================================
    // Empty cart UI — Cart empty wenakotat pennawa
    // =====================================================
    if (cartItems.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer]}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <Ionicons name="cart-outline" size={72} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                <Text style={styles.emptySubtitle}>
                    Browse restaurants and tap "Add" to add items to your cart.
                </Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => router.push('/home')}
                    activeOpacity={0.88}
                >
                    <Text style={styles.browseBtnText}>Browse Restaurants</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // =====================================================
    // Main Cart UI
    // =====================================================
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart 🛒</Text>
                <Text style={styles.headerSub}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} selected</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ---- Cart Items List ---- */}
                {cartItems.map((item) => {
                    // Image URL — SERVER_URL + relative path
                    const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : SERVER_URL + '/' + String(item.image).replace(/^\//, '')) : null;

                    return (
                        <View key={item.foodId} style={styles.cartCard}>
                            {/* Food image / placeholder */}
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.cartImage} resizeMode="cover" />
                            ) : (
                                <View style={[styles.cartImage, styles.cartImagePlaceholder]}>
                                    <Ionicons name="fast-food-outline" size={24} color={COLORS.textSecondary} />
                                </View>
                            )}

                            {/* Item info + quantity controls */}
                            <View style={styles.cartItemInfo}>
                                <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.cartItemPrice}>LKR {item.price} each</Text>

                                {/* +/- quantity buttons */}
                                <View style={styles.qtyRow}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => handleQuantityChange(item.foodId, -1)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="remove" size={16} color={COLORS.accent} />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => handleQuantityChange(item.foodId, +1)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="add" size={16} color={COLORS.accent} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Remove button */}
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => handleRemove(item.foodId)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {/* ---- Order Summary ---- */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    {cartItems.map((item) => (
                        <View key={item.foodId} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel} numberOfLines={1}>
                                {item.name} ×{item.quantity}
                            </Text>
                            <Text style={styles.summaryValue}>
                                LKR {(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    {/* Total */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>LKR {totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* ---- Bank Slip Upload (Optional) ---- */}
                <View style={styles.slipSection}>
                    <Text style={styles.slipTitle}>Payment Slip (Optional)</Text>

                    <TouchableOpacity
                        style={styles.slipPickBtn}
                        onPress={pickSlip}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="camera-outline" size={20} color={COLORS.accent} />
                        <Text style={styles.slipPickBtnText}>
                            {slipUri ? 'Slip selected ✓  (tap to change)' : 'Upload Bank Slip'}
                        </Text>
                        {slipUri && (
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                        )}
                    </TouchableOpacity>

                    {/* Slip preview */}
                    {slipUri && (
                        <Image
                            source={{ uri: slipUri }}
                            style={styles.slipPreview}
                            resizeMode="contain"
                        />
                    )}
                </View>

                {/* ---- Confirm Order Button ---- */}
                <TouchableOpacity
                    style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
                    onPress={handleConfirmOrder}
                    disabled={submitting}
                    activeOpacity={0.88}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
                            <Text style={styles.confirmBtnText}>Confirm Order</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 4 — Cart Screen:
 *   loadCart()           → AsyncStorage getCart() → state set
 *   handleQuantityChange → +/- → saveCart() update
 *   handleRemove()       → filter → saveCart()
 *   pickSlip()           → ImagePicker → slipUri state
 *   handleConfirmOrder() → FormData → POST /api/orders
 *
 * State variables:
 *   cartItems  → cart item array (from AsyncStorage)
 *   slipUri    → bank slip image URI (from gallery)
 *   submitting → loading state (button disable)
 *
 * Key concepts:
 *   useFocusEffect → tab focus wenakotat reload (cross-tab data sync)
 *   FormData multipart → text + image same request
 *   restaurantId → first cart item eken gannawa (same restaurant enforce)
 *   clearCart() → checkout success unama (AsyncStorage clear)
 *
 * API:
 *   POST /api/orders → orderController.createOrder()
 *   JWT Bearer token required
 */
