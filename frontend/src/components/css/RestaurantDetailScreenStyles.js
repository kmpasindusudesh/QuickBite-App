import { StyleSheet } from 'react-native';
import { COLORS } from './LoginScreenStyles';

export { COLORS };

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Hero section — restaurant image / placeholder
    heroImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    heroPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtn: {
        position: 'absolute',
        top: 44,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 20,
        padding: 8,
        zIndex: 10,
    },

    // Restaurant info below hero
    infoBox: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    restName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    metaText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        flex: 1,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 20,
        marginVertical: 10,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        paddingHorizontal: 20,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // Food card inside restaurant detail
    foodCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        marginHorizontal: 20,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
    },
    foodImage: {
        width: 90,
        height: 90,
    },
    foodImagePlaceholder: {
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    foodName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    foodCategory: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    foodPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    foodPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.accent,
    },
    viewBtn: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    viewBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    // Customer ta Add to Cart button (manager ekata View button)
    addCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    addCartBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // Manager edit/delete row
    managerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
    },

    // Loading / empty
    center: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
});
