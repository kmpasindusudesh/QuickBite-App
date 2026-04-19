import { StyleSheet } from 'react-native';
import { COLORS } from './LoginScreenStyles';

export { COLORS };

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ---- Header ----
    header: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    headerSub: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        paddingTop: 14,
    },

    // ---- Cart item card ----
    cartCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cartImage: {
        width: 64,
        height: 64,
        borderRadius: 10,
    },
    cartImagePlaceholder: {
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    cartItemPrice: {
        fontSize: 13,
        color: COLORS.accent,
        fontWeight: '700',
    },
    cartItemQty: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    // Quantity +/- row
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 6,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#00C85318',
        borderWidth: 1,
        borderColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        minWidth: 20,
        textAlign: 'center',
    },

    removeBtn: {
        padding: 6,
    },

    // ---- Divider ----
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },

    // ---- Summary row ----
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.accent,
    },

    // ---- Bank slip section ----
    slipSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    slipTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    slipPickBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#00C85318',
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    slipPickBtnText: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
    slipPreview: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // ---- Confirm button ----
    confirmBtn: {
        backgroundColor: COLORS.accent,
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        elevation: 4,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        marginBottom: 10,
    },
    confirmBtnDisabled: {
        opacity: 0.6,
    },
    confirmBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },

    // ---- Empty cart ----
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    browseBtn: {
        marginTop: 8,
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 28,
    },
    browseBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
});
