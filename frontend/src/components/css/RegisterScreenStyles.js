import { StyleSheet } from 'react-native';

// Login screen eke COLORS eka reuse karanawa - app eke theme eka consistent wennata
import { COLORS } from './LoginScreenStyles';

// COLORS eka anith files walatamath use wenna puluwan widihata export karanawa
export { COLORS };

// =====================================================
// Register Screen eke thiyena elements walata styles
// =====================================================
const styles = StyleSheet.create({

    // ---------- Scroll / Container ----------
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 40,
    },

    // ---------- Logo / Brand Area ----------
    logoContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        elevation: 10,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 1,
    },
    appTagline: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },

    // ---------- Form Card ----------
    formCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },

    // ---------- Input Fields ----------
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
        height: 54,
    },
    inputWrapperFocused: {
        borderColor: COLORS.accent, // Focus wenakotat emerald border
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
    },
    eyeIcon: {
        padding: 4,
    },

    // ---------- Role Selector ----------
    // "Select your Role" kiyala hadapu 3-button tap selector
    roleSectionLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    roleRow: {
        flexDirection: 'row',    // 3 buttons eka liney ekatin
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    roleCard: {
        flex: 1,                 // Sama width 3katama
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        gap: 6,
    },
    roleCardSelected: {
        borderColor: COLORS.accent,
        backgroundColor: '#00C85320',         // Subtle emerald tint
    },
    roleCardText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    roleCardTextSelected: {
        color: COLORS.accent,
    },

    // ---------- Error / Success Messages ----------
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF4D4D22',
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF5022',
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.success,
    },
    successText: {
        color: COLORS.success,
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },

    // ---------- Register Button ----------
    registerButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        flexDirection: 'row',
        gap: 8,
        elevation: 6,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // ---------- Login Link ----------
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    loginLink: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default styles;
