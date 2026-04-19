import { StyleSheet } from 'react-native';
import { COLORS } from './LoginScreenStyles'; // App eke shared colors

export { COLORS };

// =====================================================
// Role badge eke colors - role eka balagena venas color
// =====================================================
export const ROLE_COLORS = {
    manager:  { bg: '#00C85322', border: COLORS.accent,  text: COLORS.accent },
    rider:    { bg: '#4FC3F720', border: '#4FC3F7',       text: '#4FC3F7' },
    customer: { bg: '#00C85318', border: COLORS.highlightSoft, text: COLORS.highlightSoft },
};

const styles = StyleSheet.create({

    // ---------- Main Container ----------
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ---------- Scroll Content ----------
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },

    // ---------- Header Banner (Top colored strip) ----------
    headerBanner: {
        height: 160,
        backgroundColor: COLORS.surface,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    // ---------- Avatar Container ----------
    // Header eke yathat half profile pic half anita wennata
    avatarWrapper: {
        position: 'absolute',
        bottom: -50,             // Half eka header ekenn eliyata bahinawa
        alignSelf: 'center',
        zIndex: 10,
    },
    // Avatar eka tap karanna — TouchableOpacity eke width/height meka match wennata
    avatarTouchable: {
        borderRadius: 50,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.accent, // Emerald accent border
        elevation: 8,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        overflow: 'hidden',           // Image eka circle eke athule stay wennata
        position: 'relative',        // Camera badge eka absolute position walata
    },
    // Podi camera icon eka — user ta "meka tap karanna puluwan" kiyala penne
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
    },

    // ---------- Body Content ----------
    bodyContent: {
        paddingHorizontal: 24,
        paddingTop: 64, // avatarWrapper eke bottom value + extra space
        alignItems: 'center',
    },

    // ---------- Name & Role Area ----------
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,      // Full pill shape
        borderWidth: 1,
        gap: 6,
        marginBottom: 28,
    },
    roleBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'capitalize', // 'manager' → 'Manager'
    },

    // ---------- Manager: Manage Restaurants (Member 2) ----------
    manageRestaurantsButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.accent,
        gap: 10,
    },
    manageRestaurantsButtonText: {
        flex: 1,
        color: COLORS.accent,
        fontSize: 16,
        fontWeight: '700',
    },

    // ---------- Info Cards ----------
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        alignSelf: 'flex-start',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    infoCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingVertical: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        gap: 14,
    },
    infoRowBorder: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border, // Info rows meddha divider line eka
    },
    infoIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#00C85315',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },

    // ---------- Buttons ----------
    goBackButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        height: 54,
        gap: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    goBackButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF4D4D18', // Transparent red background
        borderRadius: 14,
        height: 54,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    logoutButtonText: {
        color: COLORS.error,  // Red text
        fontSize: 16,
        fontWeight: '700',
    },

    // ---------- Edit Profile Button ----------
    editProfileButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00C85318',
        borderRadius: 14,
        height: 54,
        gap: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    editProfileButtonText: {
        color: COLORS.accent,
        fontSize: 16,
        fontWeight: '700',
    },

    // ---------- Delete Account (godak dangerous — dark red) ----------
    deleteAccountButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B000028',
        borderRadius: 14,
        height: 54,
        gap: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#B71C1C',
    },
    deleteAccountButtonText: {
        color: '#FF5252',
        fontSize: 16,
        fontWeight: '700',
    },

    // ---------- Edit Modal ----------
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    modalSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 18,
    },
    modalInput: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        color: COLORS.textPrimary,
        fontSize: 15,
        marginBottom: 12,
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalCancelText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    modalSaveBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
    },
    modalSaveText: {
        color: '#FFF',
        fontWeight: '700',
    },

    // ---------- Avatar image (uploaded photo) ----------
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },

    // ---------- Loading State ----------
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },

    // ---------- Error State ----------
    errorContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 15,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
});

export default styles;
