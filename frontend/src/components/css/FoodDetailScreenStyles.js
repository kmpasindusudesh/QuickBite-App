// StyleSheet react-native eken import karanawa
import { StyleSheet } from 'react-native';
// Global color theme eka LoginScreenStyles eken gannawa
import { COLORS } from './LoginScreenStyles';

// COLORS re-export — other files walatamath access karana widihata
export { COLORS };

export default StyleSheet.create({

    // ---- Full screen container ----
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // #0A0F0A dark green background
    },

    // ---- ScrollView inner content ----
    scrollContent: {
        paddingBottom: 48, // Bottom eke space — button cut wen na widihata
    },

    // ---- Food image (top, full width) ----
    heroImage: {
        width: '100%',
        height: 240,
        resizeMode: 'cover',
    },

    // ---- Image natha wita icon placeholder ----
    heroPlaceholder: {
        width: '100%',
        height: 240,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ---- Back button (image ude float) ----
    backBtn: {
        position: 'absolute',
        top: 44,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 20,
        padding: 8,
        zIndex: 10, // Button eka image eke ude penenna
    },

    // ---- Food name + price row ----
    infoBox: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    foodName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    foodMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    foodCategory: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    foodPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.accent, // Emerald green
    },
    foodDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },

    // ---- Section divider line ----
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 20,
        marginVertical: 16,
    },

    // ---- Section title (Reviews, Write Review) ----
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        paddingHorizontal: 20,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // ---- Average rating row ----
    avgRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    avgNumber: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.accent,
    },
    avgLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    // ---- Star rating buttons row (1-5) ----
    starsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 14,
    },
    starBtn: {
        width: 44,
        height: 44,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    starBtnActive: {
        borderColor: COLORS.accent,
        backgroundColor: '#00C85322', // Transparent emerald
    },
    starBtnText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    starBtnTextActive: {
        color: COLORS.accent,
    },

    // ---- Comment text input ----
    commentInput: {
        marginHorizontal: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: COLORS.textPrimary,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 12,
    },

    // ---- Pick review image button ----
    pickImgBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 20,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: '#00C85320',
        marginBottom: 12,
    },
    pickImgText: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: 14,
    },

    // ---- Review image preview (small thumb) ----
    reviewImgPreview: {
        marginHorizontal: 20,
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 14,
    },

    // ---- Submit review button ----
    submitBtn: {
        marginHorizontal: 20,
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        elevation: 3,
        marginBottom: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    // ---- Single review card ----
    reviewCard: {
        marginHorizontal: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    reviewHeader: {
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
        letterSpacing: 2,
    },
    reviewComment: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        lineHeight: 19,
    },
    reviewImg: {
        width: '100%',
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
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
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
        marginTop: 6,
    },
    deleteReviewText: {
        color: COLORS.error,
        fontSize: 12,
        fontWeight: '700',
    },

    // ---- Loading / empty helpers ----
    center: {
        padding: 24,
        alignItems: 'center',
    },
    noReviews: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
});
