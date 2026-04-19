import { StyleSheet } from 'react-native';
import { COLORS } from './LoginScreenStyles';

export { COLORS };

// =====================================================
// Add Restaurant Screen — Green dark theme (#0A0F0A / #00C853)
// Add Food screen eke layout eka match karanawa (rounded, spacing)
// =====================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 22,
        paddingBottom: 48,
    },
    screenTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    screenSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 22,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        color: COLORS.textPrimary,
        fontSize: 15,
        marginBottom: 16,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    imagePreviewBox: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    pickImageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00C85320',
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 20,
    },
    pickImageBtnText: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: 15,
    },
    submitBtn: {
        backgroundColor: COLORS.accent,
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        opacity: 0.65,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
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
    warningBox: {
        backgroundColor: '#B9F6CA22',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.highlightSoft,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    warningText: {
        color: COLORS.highlightSoft,
        fontSize: 13,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backBtn: {
        marginRight: 12,
        padding: 8,
    },

    // ---- Divider between form and list ----
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 28,
    },

    // ---- Manage section title ----
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // ---- Single restaurant card (list) ----
    listCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    // Editing highlight
    listCardEditing: {
        borderColor: COLORS.accent,
        backgroundColor: '#00C85310',
    },
    listLogoThumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listCardText: {
        flex: 1,
    },
    listCardName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    listCardAddress: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    listCardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    listEditBtn: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: '#00C85318',
    },
    listDeleteBtn: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
        backgroundColor: '#FF525218',
    },
    // Cancel Edit button
    cancelEditBtn: {
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 4,
        marginBottom: 8,
    },
    cancelEditText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default styles;

/*
 * File eke mul sangrahaya (Sinhala):
 * Me styles file eken Add Restaurant screen eke colors saha spacing define karanawa.
 * Background dark green, accent emerald — app eke thiyena theme ekata match wenawa.
 */
