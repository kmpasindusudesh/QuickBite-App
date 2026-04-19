import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from './LoginScreenStyles'; // App eke shared COLORS eka genawa

export { COLORS }; // Anith files walatamath access karana widihata re-export karanawa

// Screen eke full width saha height gannawa
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({

    // ---------- Main Container ----------
    // Full screen dark background
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'space-between', // Logo middle, button bottom wennata
        paddingVertical: 60,
        paddingHorizontal: 28,
    },

    // ---------- Top Spacer ----------
    // Logo eka screen eke sari madhyata aragannata upper space eka
    topSpacer: {
        flex: 1,
    },

    // ---------- Center Content (Logo + Text) ----------
    centerContent: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ---------- Outer Glow Ring ----------
    // Logo circle eke wata thiyana glow ring eka
    logoOuterRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#00C85318', // Transparent emerald glow ring
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },

    // ---------- Logo Circle ----------
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        // Strong glow effect
        elevation: 20,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    // ---------- App Name ----------
    appName: {
        fontSize: 44,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 2,
        textAlign: 'center',
    },

    appNameAccent: {
        color: COLORS.accent,
    },

    // ---------- Tagline ----------
    tagline: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
        paddingHorizontal: 20,
    },

    // ---------- Feature Dots (3 small dots) ----------
    // App eke features 3k icon + text widihata pennawa
    featuresRow: {
        flexDirection: 'row',
        marginTop: 44,
        gap: 24,
    },
    featureItem: {
        alignItems: 'center',
        gap: 6,
    },
    featureIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    featureText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },

    // ---------- Bottom Content ----------
    bottomContent: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },

    // ---------- Get Started Button ----------
    getStartedButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 16,
        height: 58,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        // Strong glow
        elevation: 8,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    getStartedText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // ---------- Login Link ----------
    loginPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    loginPromptText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    loginPromptLink: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '700',
    },

    // ---------- Version Text ----------
    versionText: {
        color: '#5A7A5A',
        fontSize: 11,
        marginTop: 4,
    },
});

export default styles;
