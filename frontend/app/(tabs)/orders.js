// =====================================================
// orders.js — Orders Tab Screen (Member 4: Customer Order History)
// Customer ge order history + edit/cancel functionality
//
// API Calls:
//   GET  /api/orders          → own orders (JWT eken userId filter)
//   PUT  /api/orders/:id      → edit (Pending witharak; items/total/slip update)
//   DELETE /api/orders/:id    → cancel (Pending witharak witharak)
//
// Conditional UI Logic (important!):
//   status === 'Pending'  → Edit Order + Cancel Order buttons pennawa
//   status !== 'Pending'  → Buttons HIDE; status badge witharak pennawa
//   (Manager approve kala passe Preparing → buttons disappear)
//
// Status badge colours:
//   Pending   → yellow/amber
//   Preparing → blue
//   Ready     → green
//   Picked Up → cyan
//   On the Way → teal
//   Delivered  → purple
//
// Tab visibility: Customer witharak (Manager + Rider hide)
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
    Modal,
    Image,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Backend API URL + static file URL
import { API_BASE_URL, SERVER_URL } from '../../src/config';

// JWT token helper
import { getToken } from '../../src/utils/storage';

// Shared cart screen styles + COLORS (consistent dark green theme)
import cartStyles, { COLORS } from '../../src/components/css/CartScreenStyles';

// Status colour map — badge background + border + text colours
const STATUS_STYLE = {
    Pending:     { bg: '#FFC10722', border: '#FFC107', text: '#FFC107' },
    Preparing:   { bg: '#2196F320', border: '#2196F3', text: '#2196F3' },
    Ready:       { bg: '#00C85322', border: '#00C853', text: '#00C853' },
    'Picked Up': { bg: '#00BCD422', border: '#00BCD4', text: '#00BCD4' },
    'On the Way': { bg: '#0097A722', border: '#0097A7', text: '#4DD0E1' },
    Delivered:   { bg: '#9C27B022', border: '#9C27B0', text: '#CE93D8' },
};

// =====================================================
// Helper — foodLabel: food item eke name gannawa (populated naththam 'Item')
// =====================================================
function foodLabel(item) {
    const f = item?.foodId;
    if (f && typeof f === 'object' && f.name) return f.name;
    return 'Item';
}

// =====================================================
// Helper — formatOrderDate: ISO date string → readable format
// =====================================================
function formatOrderDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return String(iso);
    }
}

// =====================================================
// OrdersScreen — Main component
// =====================================================
export default function OrdersScreen() {
    const router = useRouter();

    // ---- State variables ----
    const [orders, setOrders]       = useState([]);     // Customer ge orders
    const [loading, setLoading]     = useState(true);   // Initial load spinner
    const [error, setError]         = useState('');     // Error message
    const [noAuth, setNoAuth]       = useState(false);  // Not logged in flag

    // Edit modal state
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingOrderId, setEditingOrderId]     = useState(null);
    const [editLines, setEditLines]               = useState([]); // Items in edit
    const [editSlipUri, setEditSlipUri]           = useState(null);
    const [savingEdit, setSavingEdit]             = useState(false);

    // =====================================================
    // loadOrders — GET /api/orders
    // JWT eken own orders witharak (backend: query.userId = req.user.id)
    // useFocusEffect — tab focus wenakotat reload
    // =====================================================
    const loadOrders = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            // Not logged in → noAuth state set; redirect suggest
            setOrders([]);
            setLoading(false);
            setError('');
            setNoAuth(true);
            return;
        }

        setNoAuth(false);
        setLoading(true);
        setError('');
        try {
            const res  = await fetch(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setError(data?.message || `Error ${res.status}`);
                setOrders([]);
                return;
            }

            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError(e?.message || 'Network error');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [loadOrders])
    );

    // =====================================================
    // openEdit — Edit modal open karanawa
    // Order eke items gena edit lines build karanawa
    // =====================================================
    const openEdit = (order) => {
        // Items eken edit lines build — foodId, quantity, name, price, image
        const lines = (order.items || []).map((it) => {
            const f = it.foodId;
            const id = f && typeof f === 'object' ? String(f._id) : String(it.foodId);
            const name = f && typeof f === 'object' && f.name ? f.name : 'Item';
            const price = f && typeof f === 'object' && f.price != null ? Number(f.price) : 0;
            const image = f && typeof f === 'object' && f.image ? f.image : null;
            return { foodId: id, quantity: Number(it.quantity) || 1, name, price, image };
        });
        if (lines.length === 0) {
            Alert.alert('Edit Order', 'This order has no items.');
            return;
        }
        setEditingOrderId(String(order._id));
        setEditLines(lines);
        setEditSlipUri(null);
        setEditModalVisible(true); // Modal pennawa
    };

    // Edit modal eke total calculate karanawa (live update)
    const editTotal = editLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    // =====================================================
    // changeQty — Edit modal eke +/- buttons
    // =====================================================
    const changeQty = (foodId, delta) => {
        setEditLines((prev) => {
            const next = prev
                .map((l) => l.foodId === foodId ? { ...l, quantity: l.quantity + delta } : l)
                .filter((l) => l.quantity > 0);
            return next.length > 0 ? next : prev; // Min 1 item
        });
    };

    // =====================================================
    // removeLine — Edit modal eke item remove
    // Min 1 item — okkoma remove karanna naha
    // =====================================================
    const removeLine = (foodId) => {
        setEditLines((prev) => {
            if (prev.length <= 1) {
                Alert.alert('Edit Order', 'Your order must have at least one item.');
                return prev;
            }
            return prev.filter((l) => l.foodId !== foodId);
        });
    };

    // =====================================================
    // saveEdit — PUT /api/orders/:id (FormData: items + total + optional slip)
    // Pending witharak update karanna puluwan (backend validate karanawa)
    // =====================================================
    const saveEdit = async () => {
        const token = await getToken();
        if (!token) {
        Alert.alert('Login Required', 'Please log in to continue.');
        router.replace('/login');
        return;
    }
    if (!editingOrderId || editLines.length === 0) return;

        setSavingEdit(true);
        try {
            // FormData build — items JSON + total + optional slip
            const formData = new FormData();
            formData.append('items', JSON.stringify(
                editLines.map((l) => ({ foodId: l.foodId, quantity: l.quantity }))
            ));
            formData.append('totalAmount', String(editTotal));

            if (editSlipUri) {
                const fileName = editSlipUri.split('/').pop() || 'slip.jpg';
                const ext      = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mime     = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('paymentSlip', { uri: editSlipUri, name: fileName, type: mime });
            }

            // PUT /api/orders/:id
            const res  = await fetch(`${API_BASE_URL}/orders/${editingOrderId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                Alert.alert('Update Failed', data.message || `Error ${res.status}`);
                return;
            }

            setEditModalVisible(false);
            setEditingOrderId(null);
            await loadOrders(); // Refresh list
            Alert.alert('Done', data.message || 'Order updated successfully.');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setSavingEdit(false);
        }
    };

    // =====================================================
    // pickEditSlip — Edit modal eke slip change karanawa
    // =====================================================
    const pickEditSlip = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) { Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.'); return; }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], allowsEditing: false, quality: 0.85,
            });
            if (result.canceled || !result.assets?.[0]) return;
            setEditSlipUri(result.assets[0].uri);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to select payment slip. Please try again.');
        }
    };

    // =====================================================
    // confirmCancel — Delete confirm dialog + DELETE /api/orders/:id
    // Pending witharak cancel karanna puluwan
    // =====================================================
    const confirmCancel = (orderId) => {
        Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
            { text: 'No', style: 'cancel' },
            { text: 'Cancel Order', style: 'destructive', onPress: () => deleteOrder(orderId) },
        ]);
    };

    const deleteOrder = async (orderId) => {
        const token = await getToken();
        if (!token) { Alert.alert('Login Required', 'Please log in to continue.'); router.replace('/login'); return; }
        try {
            const res  = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { Alert.alert('Cancel Failed', data.message || `Error ${res.status}`); return; }
            await loadOrders();
            Alert.alert('Done', data.message || 'Order cancelled successfully.');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        }
    };

    // =====================================================
    // renderStatusBadge — Status anuwa colour badge
    // =====================================================
    const renderStatusBadge = (status) => {
        const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
        return (
            <View style={[localStyles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                <Text style={[localStyles.statusBadgeText, { color: s.text }]}>{status}</Text>
            </View>
        );
    };

    // Loading spinner
    if (loading && orders.length === 0 && !error) {
        return (
            <View style={[cartStyles.container, localStyles.centered]}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <View style={cartStyles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={cartStyles.header}>
                <Text style={cartStyles.headerTitle}>My Orders</Text>
                <Text style={cartStyles.headerSub}>Order history & status</Text>
            </View>

            <ScrollView
                contentContainerStyle={cartStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Error message */}
                {error ? <Text style={localStyles.errorText}>{error}</Text> : null}

                {/* Not logged in state */}
                {!loading && noAuth ? (
                    <View style={cartStyles.emptyContainer}>
                        <Ionicons name="log-in-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={cartStyles.emptyTitle}>Please Log In</Text>
                        <Text style={cartStyles.emptySubtitle}>Log in to view your order history.</Text>
                        <TouchableOpacity style={cartStyles.browseBtn} onPress={() => router.replace('/login')} activeOpacity={0.88}>
                            <Text style={cartStyles.browseBtnText}>Go to Login</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Empty orders state */}
                {!loading && !noAuth && orders.length === 0 && !error ? (
                    <View style={cartStyles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={cartStyles.emptyTitle}>No Orders Yet</Text>
                        <Text style={cartStyles.emptySubtitle}>Place an order from your cart — it will appear here.</Text>
                        <TouchableOpacity style={cartStyles.browseBtn} onPress={() => router.push('/cart')} activeOpacity={0.88}>
                            <Text style={cartStyles.browseBtnText}>Go to Cart</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Orders list */}
                {orders.map((order) => {
                    const names = (order.items || []).map(foodLabel).join(', ');
                    const dateStr = formatOrderDate(order.createdAt);
                    const st = order.status || 'Pending';

                    // CONDITIONAL LOGIC — Pending witharak buttons pennawa
                    // Manager approve karanna kalin customer ta order eka edit/delete karanna puluwan widihata condition eka damma.
                    const showActions = st === 'Pending';

                    return (
                        <View key={String(order._id)} style={localStyles.orderCard}>
                            <Text style={localStyles.foodNames} numberOfLines={3}>{names || '—'}</Text>
                            <Text style={localStyles.totalLine}>
                                Total: <Text style={localStyles.totalValue}>LKR {Number(order.totalAmount || 0).toFixed(2)}</Text>
                            </Text>
                            <Text style={localStyles.dateLine}>{dateStr}</Text>

                            {/* Status badge — always visible */}
                            <View style={localStyles.statusRow}>{renderStatusBadge(st)}</View>

                            {/* Action buttons — Pending witharak witharak pennawa */}
                            {showActions ? (
                                <View style={localStyles.actionRow}>
                                    <TouchableOpacity style={localStyles.editBtn} onPress={() => openEdit(order)} activeOpacity={0.88}>
                                        <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                                        <Text style={localStyles.editBtnText}>Edit Order</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={localStyles.cancelBtn} onPress={() => confirmCancel(String(order._id))} activeOpacity={0.88}>
                                        <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                                        <Text style={localStyles.cancelBtnText}>Cancel Order</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Edit Order Modal */}
            <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => !savingEdit && setEditModalVisible(false)}>
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalCard}>
                        {/* Modal header */}
                        <View style={localStyles.modalHeader}>
                            <Text style={localStyles.modalTitle}>Edit Order</Text>
                            <TouchableOpacity onPress={() => !savingEdit && setEditModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close" size={26} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Modal content */}
                        <ScrollView style={localStyles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            {/* Edit item lines */}
                            {editLines.map((line) => {
                                const imageUrl = line.image ? (line.image.startsWith('http') ? line.image : SERVER_URL + '/' + String(line.image).replace(/^\//, '')) : null;
                                return (
                                    <View key={line.foodId} style={cartStyles.cartCard}>
                                        {imageUrl ? (
                                            <Image source={{ uri: imageUrl }} style={cartStyles.cartImage} resizeMode="cover" />
                                        ) : (
                                            <View style={[cartStyles.cartImage, cartStyles.cartImagePlaceholder]}>
                                                <Ionicons name="fast-food-outline" size={22} color={COLORS.textSecondary} />
                                            </View>
                                        )}
                                        <View style={cartStyles.cartItemInfo}>
                                            <Text style={cartStyles.cartItemName} numberOfLines={2}>{line.name}</Text>
                                            <Text style={cartStyles.cartItemPrice}>LKR {line.price} each</Text>
                                            <View style={cartStyles.qtyRow}>
                                                <TouchableOpacity style={cartStyles.qtyBtn} onPress={() => changeQty(line.foodId, -1)} disabled={savingEdit}>
                                                    <Ionicons name="remove" size={16} color={COLORS.accent} />
                                                </TouchableOpacity>
                                                <Text style={cartStyles.qtyText}>{line.quantity}</Text>
                                                <TouchableOpacity style={cartStyles.qtyBtn} onPress={() => changeQty(line.foodId, 1)} disabled={savingEdit}>
                                                    <Ionicons name="add" size={16} color={COLORS.accent} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={cartStyles.removeBtn} onPress={() => removeLine(line.foodId)} disabled={savingEdit}>
                                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}

                            {/* New total */}
                            <View style={cartStyles.summaryCard}>
                                <View style={cartStyles.totalRow}>
                                    <Text style={cartStyles.totalLabel}>New total</Text>
                                    <Text style={cartStyles.totalValue}>LKR {editTotal.toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* New slip */}
                            <View style={cartStyles.slipSection}>
                                <Text style={cartStyles.slipTitle}>New payment slip (optional)</Text>
                                <TouchableOpacity style={cartStyles.slipPickBtn} onPress={pickEditSlip} disabled={savingEdit}>
                                    <Ionicons name="camera-outline" size={20} color={COLORS.accent} />
                                    <Text style={cartStyles.slipPickBtnText}>{editSlipUri ? 'Slip selected ✓' : 'Upload / change slip'}</Text>
                                </TouchableOpacity>
                                {editSlipUri ? <Image source={{ uri: editSlipUri }} style={cartStyles.slipPreview} resizeMode="contain" /> : null}
                            </View>

                            {/* Save button */}
                            <TouchableOpacity style={[cartStyles.confirmBtn, savingEdit && cartStyles.confirmBtnDisabled]} onPress={saveEdit} disabled={savingEdit}>
                                {savingEdit ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={22} color="#FFF" />
                                        <Text style={cartStyles.confirmBtnText}>Save changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Local styles — orderCard, badge, action buttons, modal
const localStyles = StyleSheet.create({
    centered:       { justifyContent: 'center', alignItems: 'center' },
    errorText:      { color: COLORS.error, marginBottom: 12, textAlign: 'center' },
    orderCard:      { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    foodNames:      { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
    totalLine:      { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
    totalValue:     { color: COLORS.accent, fontWeight: '800' },
    dateLine:       { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
    statusRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    statusBadge:    { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    statusBadgeText: { fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
    actionRow:      { flexDirection: 'row', gap: 10, marginTop: 12 },
    editBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accent, backgroundColor: '#00C85312' },
    editBtnText:    { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
    cancelBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error, backgroundColor: '#FF525218' },
    cancelBtnText:  { color: COLORS.error, fontWeight: '700', fontSize: 14 },
    modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    modalCard:      { backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', paddingBottom: 24, borderWidth: 1, borderColor: COLORS.border },
    modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
    modalTitle:     { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
    modalScroll:    { paddingHorizontal: 16, paddingTop: 12 },
});
