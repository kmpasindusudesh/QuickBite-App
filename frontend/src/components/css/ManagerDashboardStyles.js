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
        backgroundColor: COLORS.surface,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
    },
    headerSub: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },

    // ---- Tab toggle bar ----
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 12,
        marginVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    tabBtn: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 9,
        paddingHorizontal: 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        backgroundColor: COLORS.surface,   // inactive
    },
    tabBtnActive: {
        backgroundColor: COLORS.accent,    // active = emerald green
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
        letterSpacing: 0.1,
        textAlign: 'center',
    },
    tabLabelActive: {
        color: '#FFF',
    },

    // Add Food tab — AddFoodScreen (flex fill, same theme as dashboard)
    embeddedScreenWrap: {
        flex: 1,
        minHeight: 0,
    },

    // ---- Shared scroll / list area ----
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },

    // ---- Order card ----
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    orderCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    customerName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    orderMeta: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.accent,
        marginBottom: 10,
    },
    orderActions: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    slipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#00C85318',
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    slipBtnText: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: '700',
    },
    acceptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.accent,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    acceptBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    markReadyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#00BCD4',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    markReadyBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // ---- Review card ----
    reviewCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    reviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    reviewStars: {
        fontSize: 14,
        color: COLORS.accent,
        letterSpacing: 1,
    },
    reviewComment: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 19,
        marginBottom: 4,
    },
    reviewFood: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: 6,
    },
    reviewDate: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    deleteReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-end',
        marginTop: 6,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    deleteReviewText: {
        color: COLORS.error,
        fontSize: 12,
        fontWeight: '700',
    },

    // ---- Shared helpers ----
    center: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    retryText: {
        color: COLORS.accent,
        fontWeight: '700',
    },

    // ---- Image modal ----
    imgModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.88)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgModalClose: {
        position: 'absolute',
        top: 44,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 20,
        padding: 8,
        zIndex: 10,
    },
    imgFull: {
        width: '92%',
        height: '65%',
        borderRadius: 12,
    },
});
