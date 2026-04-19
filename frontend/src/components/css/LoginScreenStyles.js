import { StyleSheet } from 'react-native';

// =====================================================
// QuickBite — Global Dark GREEN theme (single source of truth)
// Me COLORS object eka anith *Styles.js files import karanawa
// =====================================================
export const COLORS = {
    background:    '#0A0F0A', // Deep charcoal + green tint — main screen background
    surface:       '#141F14', // Dark forest green — cards, inputs, tab surfaces
    card:          '#141F14', // Home eke card — surface ekai same (optional alias)
    accent:        '#00C853', // Vibrant emerald — buttons, links, active icons
    accentDark:    '#009624', // Darker emerald — disabled / pressed state
    highlightSoft: '#B9F6CA', // Mint — soft highlights (optional use)
    textPrimary:   '#FFFFFF', // Main text
    textSecondary: '#A0A0A0', // Sub text, placeholders
    border:        '#2A3A2A', // Green-tinted borders
    error:         '#FF5252', // Errors, delete actions (still readable on dark)
    success:       '#00C853', // Success messages — theme eke accent ekai align
};

// =====================================================
// Login Screen styles
// =====================================================
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 10,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 1,
    },
    appTagline: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },

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
        marginBottom: 24,
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
        height: 54,
    },
    inputWrapperFocused: {
        borderColor: COLORS.accent,
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

    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF525222',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },

    loginButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        flexDirection: 'row',
        gap: 8,
        elevation: 6,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    loginButtonDisabled: {
        backgroundColor: COLORS.accentDark,
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textSecondary,
        paddingHorizontal: 12,
        fontSize: 13,
    },

    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    registerLink: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default styles;
