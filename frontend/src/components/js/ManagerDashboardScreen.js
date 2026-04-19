// =====================================================
// ManagerDashboardScreen — Member 4 + 2 + 6 integration
// Add Food kalla bottom bar eken ain karala, dashboard eke tabs 4k hadala ethannma damma.
// Tab 1: My Restaurants (AddRestaurantScreen)
// Tab 2: Manage Orders  (GET /api/orders, status update)
// Tab 3: Customer Reviews (GET /api/reviews, delete moderation)
// Tab 4: Add Food (AddFoodScreen embedded)
// =====================================================
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getToken } from '../../utils/storage';
import styles, { COLORS } from '../css/ManagerDashboardStyles';

// AddRestaurantScreen is the existing all-in-one restaurant component
import AddRestaurantScreen from './AddRestaurantScreen';
import AddFoodScreen from './AddFoodScreen';

// ---- Helpers ----
const buildStars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

const STATUS_COLORS = {
    Pending:    { bg: '#FF980020', border: '#FF9800', text: '#FF9800' },
    Preparing:  { bg: '#2196F320', border: '#2196F3', text: '#2196F3' },
    Ready:      { bg: '#00C85320', border: '#00C853', text: '#00C853' },
    'Picked Up': { bg: '#00BCD420', border: '#00BCD4', text: '#00BCD4' },
    'On the Way': { bg: '#0097A720', border: '#0097A7', text: '#4DD0E1' },
    Delivered:  { bg: '#9C27B020', border: '#9C27B0', text: '#CE93D8' },
};

// =====================================================
// ManagerDashboardScreen
// =====================================================
export default function ManagerDashboardScreen() {
    const router = useRouter();

    // Manager ge wada lesi karanna tab 4kata dashboard eka kaduwa (restaurants | orders | reviews | addFood).
    const [activeTab, setActiveTab] = useState('restaurants');

    // ---- Orders tab state ----
    const [orders, setOrders]               = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError]     = useState('');
    const [slipModal, setSlipModal]         = useState({ visible: false, url: '' });
    const [updatingId, setUpdatingId]       = useState(null);

    // ---- Reviews tab state ----
    const [reviews, setReviews]               = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError]     = useState('');
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    // ==========================================================
    // ORDERS — GET /api/orders (manager sees all)
    // ==========================================================
    const loadOrders = useCallback(async () => {
        setOrdersLoading(true);
        setOrdersError('');
        try {
            const token = await getToken();
            const res   = await fetch(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data  = await res.json().catch(() => ({}));
            if (!res.ok) {
                setOrdersError(data.message || `Error ${res.status}`);
                setOrders([]);
                return;
            }
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setOrdersError('Network error. Please check your connection.');
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    // ==========================================================
    // REVIEWS — GET /api/reviews (plural, not /api/review) — manager JWT; reviewController.getReviews
    // Dashboard "Customer Reviews" tab: handleTabChange('reviews') + focus eken loadReviews() trigger wenawa.
    // ==========================================================
    const loadReviews = useCallback(async () => {
        setReviewsLoading(true);
        setReviewsError('');
        try {
            const token = await getToken();
            const res   = await fetch(`${API_BASE_URL}/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data  = await res.json().catch(() => ({}));
            if (!res.ok) {
                setReviewsError(data.message || `Error ${res.status}`);
                setReviews([]);
                return;
            }
            // Handle both plain array and { reviews: [] }
            const list = Array.isArray(data) ? data : (Array.isArray(data.reviews) ? data.reviews : []);
            setReviews(list);
        } catch (e) {
            console.error(e);
            setReviewsError('Network error. Please check your connection.');
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, []);

    // Refresh active tab data when screen gains focus
    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'orders')  loadOrders();
            if (activeTab === 'reviews') loadReviews();
        }, [activeTab, loadOrders, loadReviews])
    );

    // ==========================================================
    // Tab switch — load data on first visit to each tab
    // ==========================================================
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'orders')  loadOrders();
        if (tab === 'reviews') loadReviews();
    };

    // ==========================================================
    // Manager kema hadala iwara unama 'Ready' karanna button ekak damma. Rider ta kema eka penna meka hadanna ona.
    // MARK READY — PUT /api/orders/:id/status (Preparing → Ready)
    // ==========================================================
    const handleMarkReady = async (orderId) => {
        setUpdatingId(orderId);
        try {
            const token = await getToken();
            const res   = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method:  'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Ready' }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                Alert.alert('Error', data.message || 'Failed to update order status. Please try again.');
                return;
            }
            setOrders((prev) =>
                prev.map((o) => (String(o._id) === String(orderId) ? { ...o, status: 'Ready' } : o))
            );
            Alert.alert('Done', data.message || 'Order marked as Ready! 🍽️');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================================
    // UPDATE ORDER STATUS — PUT /api/orders/:id/status
    // Order eke slip eka balala accept karana thana.
    // ==========================================================
    const handleAcceptOrder = async (orderId) => {
        setUpdatingId(orderId);
        try {
            const token = await getToken();
            const res   = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method:  'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Preparing' }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                Alert.alert('Error', data.message || 'Failed to update order status. Please try again.');
                return;
            }
            // UI update — me order eke status set karanawa
            setOrders((prev) =>
                prev.map((o) => (String(o._id) === String(orderId) ? { ...o, status: 'Preparing' } : o))
            );
            Alert.alert('Done', data.message || 'Order is now being prepared! 👨‍🍳');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setUpdatingId(null);
        }
    };

    // ==========================================================
    // DELETE REVIEW — DELETE /api/reviews/:id
    // Manager reviews okkoma delete karanna puluwan (moderation)
    // ==========================================================
    const handleDeleteReview = (reviewId) => {
        Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Delete',
                style: 'destructive',
                onPress: async () => {
                    setDeletingReviewId(reviewId);
                    try {
                        const token = await getToken();
                        const res   = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                            method:  'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                            Alert.alert('Error', data.message || 'Failed to delete review. Please try again.');
                            return;
                        }
                        setReviews((prev) => prev.filter((r) => String(r._id) !== String(reviewId)));
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Error', e?.message || 'Network error');
                    } finally {
                        setDeletingReviewId(null);
                    }
                },
            },
        ]);
    };

    // ==========================================================
    // Render order items as short text
    // ==========================================================
    const renderItems = (items = []) => {
        if (!items.length) return '—';
        return items
            .map((it) => {
                const foodName = it.foodId?.name || 'Item';
                return `${it.quantity}× ${foodName}`;
            })
            .join(', ');
    };

    // ==========================================================
    // Payment slip URL
    // ==========================================================
    const slipUrl = (path) => {
        return path ? (path.startsWith('http') ? path : SERVER_URL + '/' + String(path).replace(/^\//, '')) : null;
    };

    // ==========================================================
    // ORDERS TAB CONTENT
    // ==========================================================
    const renderOrdersTab = () => {
        if (ordersLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.emptyText}>Loading orders...</Text>
                </View>
            );
        }
        if (ordersError) {
            return (
                <View style={styles.center}>
                    <Ionicons name="cloud-offline-outline" size={44} color={COLORS.textSecondary} />
                    <Text style={[styles.emptyText, { color: COLORS.error }]}>{ordersError}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadOrders}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (!orders.length) {
            return (
                <View style={styles.center}>
                    <Ionicons name="receipt-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>No orders at the moment.</Text>
                </View>
            );
        }

        return orders.map((order) => {
            const sc   = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            const name = order.userId?.name || 'Customer';
            const isPending    = order.status === 'Pending';
            const isPreparing  = order.status === 'Preparing';
            const isUpdating = String(updatingId) === String(order._id);
            const slip = slipUrl(order.paymentSlip);

            return (
                <View key={String(order._id)} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                        <Text style={styles.orderId}>#{String(order._id).slice(-6).toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                            <Text style={[styles.statusText, { color: sc.text }]}>{order.status}</Text>
                        </View>
                    </View>

                    <Text style={styles.customerName}>{name}</Text>
                    <Text style={styles.orderMeta}>Items: {renderItems(order.items)}</Text>
                    <Text style={styles.orderTotal}>LKR {order.totalAmount}</Text>

                    <View style={styles.orderActions}>
                        {/* Order eke slip eka balala accept karana thana. */}
                        {slip && (
                            <TouchableOpacity
                                style={styles.slipBtn}
                                onPress={() => setSlipModal({ visible: true, url: slip })}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="image-outline" size={15} color={COLORS.accent} />
                                <Text style={styles.slipBtnText}>View Bank Slip</Text>
                            </TouchableOpacity>
                        )}

                        {isPending && (
                            <TouchableOpacity
                                style={styles.acceptBtn}
                                onPress={() => handleAcceptOrder(String(order._id))}
                                disabled={isUpdating}
                                activeOpacity={0.85}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={15} color="#FFF" />
                                        <Text style={styles.acceptBtnText}>Accept & Prepare</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {isPreparing && (
                            <TouchableOpacity
                                style={styles.markReadyBtn}
                                onPress={() => handleMarkReady(String(order._id))}
                                disabled={isUpdating}
                                activeOpacity={0.85}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="restaurant-outline" size={15} color="#FFF" />
                                        <Text style={styles.markReadyBtnText}>Mark as Ready</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        });
    };

    // ==========================================================
    // REVIEWS TAB CONTENT
    // ==========================================================
    const renderReviewsTab = () => {
        if (reviewsLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.emptyText}>Loading reviews...</Text>
                </View>
            );
        }
        if (reviewsError) {
            return (
                <View style={styles.center}>
                    <Ionicons name="cloud-offline-outline" size={44} color={COLORS.textSecondary} />
                    <Text style={[styles.emptyText, { color: COLORS.error }]}>{reviewsError}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadReviews}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (!reviews.length) {
            return (
                <View style={styles.center}>
                    <Ionicons name="star-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>No reviews yet.</Text>
                </View>
            );
        }

        return reviews.map((review) => {
            const rid = String(review._id);
            const isDeleting = String(deletingReviewId) === rid;

            return (
                <View key={rid} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                        <Text style={styles.reviewerName}>
                            {review.userId?.name || 'User'}
                        </Text>
                        <Text style={styles.reviewStars}>{buildStars(review.rating)}</Text>
                    </View>

                    {review.comment ? (
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                    ) : null}

                    <Text style={styles.reviewFood}>
                        Food: {review.foodId?.name || 'QuickBite (general)'}
                    </Text>

                    <Text style={styles.reviewDate}>
                        {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : ''}
                    </Text>

                    <TouchableOpacity
                        style={styles.deleteReviewBtn}
                        onPress={() => handleDeleteReview(rid)}
                        disabled={isDeleting}
                        activeOpacity={0.8}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color={COLORS.error} />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                                <Text style={styles.deleteReviewText}>Delete</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            );
        });
    };

    // ==========================================================
    // RENDER
    // ==========================================================
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

            {/* ---- Header ---- */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Manager Dashboard</Text>
                    <Text style={styles.headerSub}>Restaurants · Orders · Reviews · Add Food</Text>
                </View>
            </View>

            {/* ---- Tab Toggle Bar ---- */}
            <View style={styles.tabBar}>
                {[
                    { key: 'restaurants', label: 'My\nRestaurants', icon: 'storefront-outline' },
                    { key: 'orders',      label: 'Manage\nOrders',   icon: 'receipt-outline' },
                    { key: 'reviews',     label: 'Customer\nReviews', icon: 'star-outline' },
                    { key: 'addFood',     label: 'Add\nFood',       icon: 'fast-food-outline' },
                ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                            onPress={() => handleTabChange(tab.key)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={17}
                                color={isActive ? '#FFF' : COLORS.textSecondary}
                            />
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ---- Tab Content ---- */}
            {activeTab === 'restaurants' ? (
                <AddRestaurantScreen />
            ) : activeTab === 'addFood' ? (
                <View style={styles.embeddedScreenWrap}>
                    <AddFoodScreen embedded />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'orders'  && renderOrdersTab()}
                    {activeTab === 'reviews' && renderReviewsTab()}
                </ScrollView>
            )}

            {/* ---- Bank Slip Full-screen Modal ---- */}
            <Modal
                visible={slipModal.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setSlipModal({ visible: false, url: '' })}
            >
                <View style={styles.imgModalOverlay}>
                    <TouchableOpacity
                        style={styles.imgModalClose}
                        onPress={() => setSlipModal({ visible: false, url: '' })}
                    >
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: slipModal.url }}
                        style={styles.imgFull}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </View>
    );
}
