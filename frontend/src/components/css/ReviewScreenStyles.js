// StyleSheet import karanawa
import { StyleSheet } from 'react-native';
// Global COLORS object gannawa — green dark theme
import { COLORS } from './LoginScreenStyles';

// COLORS re-export — screen file eke import karana widihata
export { COLORS };

export default StyleSheet.create({

    // ---- Outermost screen container ----
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // #0A0F0A deep dark green
    },

    // ---- ScrollView eke inner padding ----
    scrollContent: {
        padding: 20,
        paddingBottom: 50,
    },

    // ---- Screen title (Reviews & Ratings) ----
    screenTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },

    // ---- Screen subtitle ----
    screenSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },

    // ---- Field label (FOOD, RATING, COMMENT, etc.) ----
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // ---- Picker wrapper (food picker) ----
    pickerWrapper: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },

    // ---- Picker component style ----
    picker: {
        color: COLORS.textPrimary,
        height: 52,
    },

    // ---- Loading row (while picker loading) ----
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginBottom: 16,
    },

    // ---- Star buttons row ----
    starsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },

    // ---- Single star button (default) ----
    starBtn: {
        width: 50,
        height: 50,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ---- Star button selected (tap kala) ----
    starBtnActive: {
        borderColor: COLORS.accent,
        backgroundColor: '#00C85322',
    },

    // ---- Star button label text ----
    starBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },

    // ---- Star button label active ----
    starBtnTextActive: {
        color: COLORS.accent,
    },

    // ---- Comment text input ----
    commentInput: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: COLORS.textPrimary,
        fontSize: 14,
        minHeight: 90,
        textAlignVertical: 'top',
        marginBottom: 14,
    },

    // ---- Image pick button ----
    pickImgBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: '#00C85320',
        marginBottom: 14,
    },

    // ---- Image pick button text ----
    pickImgText: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: 14,
        flex: 1,
    },

    // ---- Selected image small preview ----
    imgPreview: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginBottom: 14,
    },

    // ---- Submit button ----
    submitBtn: {
        backgroundColor: COLORS.accent,
        borderRadius: 14,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
        elevation: 3,
    },

    // ---- Submit button (disabled) ----
    submitBtnDisabled: {
        opacity: 0.6,
    },

    // ---- Submit button text ----
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    // ---- Inline Add Review (Reviews tab) ----
    addReviewSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addReviewTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    postReviewBtn: {
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    postReviewBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    addPhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        backgroundColor: '#00C85312',
        marginBottom: 10,
    },
    addPhotoBtnText: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: 15,
    },
    reviewPhotoPreviewWrap: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        position: 'relative',
    },
    reviewPhotoThumb: {
        width: 96,
        height: 96,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    reviewPhotoRemove: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.background,
        borderRadius: 14,
    },

    // ---- Section divider ----
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 18,
    },

    // ---- Section title (All Reviews) ----
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // ---- Average rating chip ----
    avgChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 18,
    },
    avgNumber: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.accent,
    },
    avgLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    // ---- Single review card ----
    reviewCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Global feed cards — ekakata hati penena card
    feedCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    feedFoodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    feedFoodName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.accent,
    },
    feedHintBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#00C85312',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    feedHintText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 19,
    },
    feedHomeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.accent,
        marginBottom: 20,
    },
    feedHomeBtnText: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: 15,
    },

    // ---- Review card top row (name + stars) ----
    reviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },

    // ---- Reviewer's name ----
    reviewerName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    // ---- Star string (★★★☆☆) ----
    reviewStars: {
        fontSize: 15,
        color: COLORS.accent,
        letterSpacing: 1,
    },

    // ---- Review comment text ----
    reviewComment: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        lineHeight: 19,
    },

    // ---- Review image ----
    reviewImg: {
        width: '100%',
        height: 170,
        borderRadius: 10,
        marginBottom: 8,
        resizeMode: 'cover',
    },

    // ---- Review date ----
    reviewDate: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },

    // ---- Delete review button ----
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-end',
        marginTop: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
    },

    // ---- Delete button text ----
    deleteBtnText: {
        color: COLORS.error,
        fontSize: 12,
        fontWeight: '700',
    },

    // ---- Center helper (loading spinner / empty text) ----
    center: {
        paddingVertical: 30,
        alignItems: 'center',
    },

    // ---- Empty reviews text ----
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 10,
    },

    // ---- Error box ----
    errorBox: {
        backgroundColor: '#FF4D4D22',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
    },

    // ---- Edit review (owner) — subtle pencil on card ----
    editIconBtn: {
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#00C85310',
    },

    // ---- Edit modal (dark green sheet) ----
    editModalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.72)',
    },
    editModalDismissArea: {
        flex: 1,
    },
    editModalKeyboard: {
        width: '100%',
    },
    editModalSheet: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderTopWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 28,
    },
    editModalGrabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    editModalErrorText: {
        color: COLORS.error,
        fontSize: 13,
        marginBottom: 12,
    },
    editModalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    editModalCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    editModalCancelText: {
        color: COLORS.textSecondary,
        fontWeight: '700',
        fontSize: 15,
    },
    editModalSaveBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
    },
    editModalSaveText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 15,
    },
});
