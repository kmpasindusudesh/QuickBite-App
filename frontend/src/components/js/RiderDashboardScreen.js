// =====================================================
// RiderDashboardScreen — Member 5: Delivery & Dispatch
// Member 5 ge requirement ekata anuwa Rider ta wenama database collection ekak (Deliveries)
// saha sampurna CRUD (Create, Read, Update, Delete) ekak hadala file upload ekath ekka connect kala.
// Database eke 'deliveries' collection eka hadila nathi nisa saha ID eka pass wena widiha weradi nisa
// eka fix kala. Dan button eka weda karanna ona.
//
// Tab 1 (Available Orders): GET /api/orders/available  → show Ready orders
// Tab 2 (My Active Task):   GET /api/deliveries        → show rider's non-Delivered tasks
//
// Accept  → POST /api/deliveries { orderId }          ← order._id string (must not be undefined!)
// Update  → PUT  /api/deliveries/:deliveryId { status }          (JSON)
// Proof   → PUT  /api/deliveries/:deliveryId { status, file }    (FormData, Multer)
// Cancel  → DELETE /api/deliveries/:deliveryId
// =====================================================
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL } from '../../config';
import { getToken } from '../../utils/storage';
import styles, { COLORS } from '../css/ManagerDashboardStyles';

// ---- URL constants (trailing slash remove) -----------------------------------
const API_ROOT          = String(API_BASE_URL || '').replace(/\/+$/, '');
const URL_AVAILABLE     = `${API_ROOT}/orders/available`;   // GET — Ready order pool
const URL_DELIVERIES    = `${API_ROOT}/deliveries`;          // GET/POST — Delivery collection

// ---- Status colour map -------------------------------------------------------
const STATUS_COLORS = {
    Ready:        { bg: '#00C85320', border: '#00C853', text: '#00C853' },
    Assigned:     { bg: '#FF980020', border: '#FF9800', text: '#FFA726' },
    'Picked Up':  { bg: '#00BCD420', border: '#00BCD4', text: '#00BCD4' },
    'On the Way': { bg: '#0097A720', border: '#0097A7', text: '#4DD0E1' },
    Delivered:    { bg: '#9C27B020', border: '#9C27B0', text: '#CE93D8' },
};

// ---- Helpers -----------------------------------------------------------------
function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
}

function renderItemsLine(items = []) {
    if (!items.length) return '—';
    return items
        .map((it) => `${it.quantity}× ${it.foodId?.name || 'Item'}`)
        .join(', ');
}

function StatusBadge({ status }) {
    const sc = STATUS_COLORS[status] || STATUS_COLORS.Assigned;
    return (
        <View style={[localStyles.badge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[localStyles.badgeText, { color: sc.text }]}>{status}</Text>
        </View>
    );
}

// ==============================================================================
export default function RiderDashboardScreen() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('available');

    // Tab 1 — available orders (Order docs)
    const [available, setAvailable]               = useState([]);
    const [availableLoading, setAvailableLoading] = useState(false);
    const [availableError, setAvailableError]     = useState('');

    // Tab 2 — rider's deliveries (Delivery docs with populated orderId)
    const [deliveries, setDeliveries]             = useState([]);
    const [activeLoading, setActiveLoading]       = useState(false);
    const [activeError, setActiveError]           = useState('');

    const [busyId, setBusyId] = useState(null); // delivery._id or order._id being processed

    // ── loaders ──────────────────────────────────────────────────────────────
    const loadAvailable = useCallback(async () => {
        setAvailableLoading(true);
        setAvailableError('');
        try {
            const token = await getToken();
            const res   = await fetch(URL_AVAILABLE, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data  = await res.json().catch(() => ({}));
            if (!res.ok) {
                setAvailableError(data.message || `Error ${res.status}`);
                setAvailable([]);
                return;
            }
            setAvailable(normalizeList(data));
        } catch (e) {
            console.error(e);
            setAvailableError('Network error. Please check your connection.');
            setAvailable([]);
        } finally {
            setAvailableLoading(false);
        }
    }, []);

    const loadDeliveries = useCallback(async () => {
        setActiveLoading(true);
        setActiveError('');
        try {
            const token = await getToken();
            const res   = await fetch(URL_DELIVERIES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data  = await res.json().catch(() => ({}));
            if (!res.ok) {
                setActiveError(data.message || `Error ${res.status}`);
                setDeliveries([]);
                return;
            }
            // Only show non-Delivered tasks in the active tab
            const all   = normalizeList(data);
            setDeliveries(all.filter((d) => d.status !== 'Delivered'));
        } catch (e) {
            console.error(e);
            setActiveError('Network error. Please check your connection.');
            setDeliveries([]);
        } finally {
            setActiveLoading(false);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        await Promise.all([loadAvailable(), loadDeliveries()]);
    }, [loadAvailable, loadDeliveries]);

    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'available') loadAvailable();
            else loadDeliveries();
        }, [activeTab, loadAvailable, loadDeliveries])
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'available') loadAvailable();
        else loadDeliveries();
    };

    // ── CREATE — Accept delivery ──────────────────────────────────────────────
       const acceptDelivery = async (orderId) => {
        // Guard: orderId undefined / empty unoth backend ekata yanna epa
        if (!orderId) {
            console.warn('[acceptDelivery] orderId is undefined or empty — button pressed too early?');
            Alert.alert('Error', 'Order ID could not be found. Please try again.');
            return;
        }
        const orderIdStr = String(orderId);
        console.log('Accepting Order ID:', orderIdStr); // debug — undefined da kiyala check karanna

        setBusyId(orderIdStr);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Login Required', 'Please log in to continue.');
                return;
            }

            const res = await fetch(URL_DELIVERIES, {
                method:  'POST',
                headers: {
                    Authorization:  `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId: orderIdStr }),
            });

            const data = await res.json().catch(() => ({}));
            console.log('[acceptDelivery] Response:', res.status, data);

            if (!res.ok) {
                Alert.alert('Accept Failed', data.message || `Error ${res.status}`);
                return;
            }
            Alert.alert('Delivery Accepted', data.message || 'The delivery has been accepted successfully.');
            await refreshAll();
            setActiveTab('active');
        } catch (e) {
            console.error('[acceptDelivery] catch:', e);
            Alert.alert('Error', e?.message || 'Network error. Please check your connection.');
        } finally {
            setBusyId(null);
        }
    };

    // ── UPDATE — status change (JSON) ─────────────────────────────────────────
    const updateStatus = async (deliveryId, newStatus) => {
        setBusyId(String(deliveryId));
        try {
            const token = await getToken();
            const res   = await fetch(`${URL_DELIVERIES}/${deliveryId}`, {
                method:  'PUT',
                headers: {
                    Authorization:  `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                Alert.alert('Error', data.message || 'Failed to update status. Please try again.');
                return;
            }
            await loadDeliveries();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setBusyId(null);
        }
    };

    // ── UPDATE — proof upload (FormData) → Delivered ──────────────────────────
    const completeWithProof = async (deliveryId) => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Camera Permission Required', 'Please grant camera access to capture a delivery proof photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality:    0.85,
        });
        if (result.canceled || !result.assets?.[0]?.uri) return;

        const uri = result.assets[0].uri;
        setBusyId(String(deliveryId));
        try {
            const token    = await getToken();
            const formData = new FormData();
            const fileName = uri.split('/').pop() || 'proof.jpg';
            const ext      = (fileName.split('.').pop() || 'jpg').toLowerCase();
            const mime     = ext === 'png' ? 'image/png' : 'image/jpeg';
            formData.append('deliveryProof', { uri, name: fileName, type: mime });
            formData.append('status', 'Delivered');

            const res = await fetch(`${URL_DELIVERIES}/${deliveryId}`, {
                method:  'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body:    formData,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                Alert.alert('Upload Failed', data.message || `Error ${res.status}`);
                return;
            }
            Alert.alert('Delivery Completed', data.message || 'The order has been marked as delivered successfully.');
            await refreshAll();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setBusyId(null);
        }
    };

    // ── DELETE — cancel delivery ──────────────────────────────────────────────
    const cancelDelivery = (deliveryId) => {
        Alert.alert(
            'Cancel Delivery',
            'Are you sure you want to cancel this delivery? The order will be returned to the available pool.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setBusyId(String(deliveryId));
                        try {
                            const token = await getToken();
                            const res   = await fetch(
                                `${URL_DELIVERIES}/${deliveryId}`,
                                {
                                    method:  'DELETE',
                                    headers: { Authorization: `Bearer ${token}` },
                                }
                            );
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                                Alert.alert('Error', data.message || 'Failed to cancel delivery. Please try again.');
                                return;
                            }
                            await refreshAll();
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', e?.message || 'Network error');
                        } finally {
                            setBusyId(null);
                        }
                    },
                },
            ]
        );
    };

    // ── Tab renderers ─────────────────────────────────────────────────────────
    const renderAvailableTab = () => {
        if (availableLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.emptyText}>Loading available orders...</Text>
                </View>
            );
        }
        if (availableError) {
            return (
                <View style={styles.center}>
                    <Text style={[styles.emptyText, { color: COLORS.error }]}>
                        {availableError}
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadAvailable}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (!available.length) {
            return (
                <View style={styles.center}>
                    <Ionicons name="bicycle-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>No orders available at the moment.</Text>
                </View>
            );
        }

        return available.map((order) => {
            // order._id eka hama widiyama thiyanama ona — undefined unoth acceptDelivery eke guard eka block karawi
            const oid  = String(order?._id || '');
            const busy = busyId === oid;
            return (
                <View key={oid || Math.random().toString()} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                        <Text style={styles.orderId}>
                            #{(oid || '??????').slice(-6).toUpperCase()}
                        </Text>
                        <StatusBadge status={order.status} />
                    </View>
                    <Text style={styles.customerName}>
                        {order.userId?.name || 'Customer'}
                    </Text>
                    <Text style={styles.orderMeta}>
                        {order.restaurantId?.name || 'Restaurant'}
                    </Text>
                    <Text style={styles.orderMeta}>
                        Items: {renderItemsLine(order.items)}
                    </Text>
                    <Text style={styles.orderTotal}>LKR {order.totalAmount}</Text>
                    <View style={styles.orderActions}>
                        {/* Accept Delivery button — order._id (oid) POST /api/deliveries ekata yawanawa */}
                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => acceptDelivery(oid)}
                            disabled={busy || !oid}
                            activeOpacity={0.85}
                        >
                            {busy ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="hand-left-outline" size={15} color="#FFF" />
                                    <Text style={styles.acceptBtnText}>Accept Delivery</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        });
    };

    const renderActiveTab = () => {
        if (activeLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.emptyText}>Loading active tasks...</Text>
                </View>
            );
        }
        if (activeError) {
            return (
                <View style={styles.center}>
                    <Text style={[styles.emptyText, { color: COLORS.error }]}>
                        {activeError}
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadDeliveries}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (!deliveries.length) {
            return (
                <View style={styles.center}>
                    <Ionicons name="cube-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>No active deliveries.</Text>
                    <Text style={[styles.emptyText, { fontSize: 12, marginTop: 6 }]}>
                        Go to the Available tab to accept an order.
                    </Text>
                </View>
            );
        }

        return deliveries.map((d) => {
            const did        = String(d._id);
            const busy       = busyId === did;
            const order      = d.orderId || {};           // populated order
            const isAssigned = d.status === 'Assigned';
            const isPickedUp = d.status === 'Picked Up';
            const isOnWay    = d.status === 'On the Way';
            const canPickUp  = isAssigned;
            const canStart   = isAssigned || isPickedUp;
            const canComplete = isAssigned || isPickedUp || isOnWay;
            const canCancel  = isAssigned || isPickedUp;

            return (
                <View key={did} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                        <Text style={styles.orderId}>
                            #{String(order._id || did).slice(-6).toUpperCase()}
                        </Text>
                        <StatusBadge status={d.status} />
                    </View>

                    <Text style={styles.customerName}>
                        {order.userId?.name || 'Customer'}
                    </Text>
                    <Text style={styles.orderMeta}>
                        {order.restaurantId?.name || 'Restaurant'}
                    </Text>
                    <Text style={styles.orderMeta}>
                        Items: {renderItemsLine(order.items || [])}
                    </Text>
                    <Text style={styles.orderTotal}>
                        LKR {order.totalAmount || '—'}
                    </Text>

                    <View style={styles.orderActions}>
                        {/* Picked Up (food collected from restaurant) */}
                        {canPickUp && (
                            <TouchableOpacity
                                style={localStyles.pickUpBtn}
                                onPress={() => updateStatus(did, 'Picked Up')}
                                disabled={busy}
                                activeOpacity={0.85}
                            >
                                {busy ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="bag-check-outline" size={15} color="#FFF" />
                                        <Text style={localStyles.pickUpBtnText}>Picked Up</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Start Delivery → On the Way */}
                        {canStart && (
                            <TouchableOpacity
                                style={localStyles.startBtn}
                                onPress={() => updateStatus(did, 'On the Way')}
                                disabled={busy}
                                activeOpacity={0.85}
                            >
                                {busy ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="navigate-outline" size={15} color="#FFF" />
                                        <Text style={localStyles.startBtnText}>Start Delivery</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Complete Delivery → photo upload → Delivered */}
                        {canComplete && (
                            <TouchableOpacity
                                style={localStyles.completeBtn}
                                onPress={() => completeWithProof(did)}
                                disabled={busy}
                                activeOpacity={0.85}
                            >
                                {busy ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={15} color="#FFF" />
                                        <Text style={localStyles.completeBtnText}>Complete Delivery</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Cancel — DELETE /api/deliveries/:id */}
                        {canCancel && (
                            <TouchableOpacity
                                style={localStyles.releaseBtn}
                                onPress={() => cancelDelivery(did)}
                                disabled={busy}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                                <Text style={localStyles.releaseBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Rider Dashboard</Text>
                    <Text style={styles.headerSub}>Available Orders · My Active Task</Text>
                </View>
            </View>

            <View style={styles.tabBar}>
                {[
                    { key: 'available', label: 'Available\nOrders', icon: 'list-outline' },
                    { key: 'active',    label: 'My Active\nTask',   icon: 'bicycle-outline' },
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
                                size={18}
                                color={isActive ? '#FFF' : COLORS.textSecondary}
                            />
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'available' ? renderAvailableTab() : renderActiveTab()}
            </ScrollView>
        </View>
    );
}

// ── Local styles ─────────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    pickUpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#F57C00',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    pickUpBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#0288D1',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    startBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    completeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#00838F',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    completeBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    releaseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#FF525218',
        borderWidth: 1,
        borderColor: COLORS.error,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    releaseBtnText: {
        color: COLORS.error,
        fontSize: 12,
        fontWeight: '700',
    },
});




