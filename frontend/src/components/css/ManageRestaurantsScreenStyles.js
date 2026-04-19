import { StyleSheet } from 'react-native';
import { COLORS } from './LoginScreenStyles';

export { COLORS };

// =====================================================
// Manage Restaurants — #0A0F0A bg, #141F14 cards (Member 2)
// =====================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        marginRight: 12,
        padding: 8,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
    },
    screenSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        marginBottom: 14,
    },
    cardTop: {
        flexDirection: 'row',
        gap: 12,
    },
    logoThumb: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundColor: COLORS.background,
    },
    cardTextCol: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    restaurantMeta: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
        justifyContent: 'flex-end',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: '#00C85318',
    },
    editBtnText: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: 14,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.error,
        backgroundColor: '#FF525218',
    },
    deleteBtnText: {
        color: COLORS.error,
        fontWeight: '700',
        fontSize: 14,
    },
    center: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 24,
    },
    errorText: {
        color: COLORS.error,
        marginBottom: 12,
    },
});

export default styles;
