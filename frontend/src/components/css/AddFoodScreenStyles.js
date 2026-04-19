import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './LoginScreenStyles';

export { COLORS };

// =====================================================
// Add Food Screen — Login/Profile eke dark theme eka match karanawa
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
    // Manager Dashboard tab eke embed karakotat uda header row naha — padding balance karanawa
    scrollContentEmbedded: {
        paddingTop: 12,
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
        minHeight: 100,
        textAlignVertical: 'top',
    },
    // Category "Picker" — touch karakotat modal eka open wenawa
    categoryField: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryFieldText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        flex: 1,
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
        backgroundColor: '#00C85320', // Transparent emerald — pick image row
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalSheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
        maxHeight: '55%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    categoryOption: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryOptionText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        textAlign: 'center',
    },
    categoryOptionSelected: {
        color: COLORS.accent,
        fontWeight: '700',
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
    // Restaurant Picker — green dark theme eka match (border + surface)
    pickerWrapper: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginBottom: 16,
        // Android dropdown okkoma items pennanna — overflow hidden dapu thana clip wenawa
        overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    },
    picker: {
        color: COLORS.textPrimary,
        ...Platform.select({
            ios: { height: 140 },
            android: { color: COLORS.textPrimary },
        }),
    },
    pickerLoadingRow: {
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
    // Add Food — custom restaurant dropdown (TextInput wage button eka)
    restaurantDropdownBtn: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    restaurantDropdownBtnText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        flex: 1,
        marginRight: 8,
    },
    restaurantDropdownList: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 240,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.28,
                shadowRadius: 10,
            },
            android: { elevation: 8 },
        }),
    },
    restaurantDropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    restaurantDropdownItemText: {
        color: COLORS.textPrimary,
        fontSize: 15,
    },
});

export default styles;
