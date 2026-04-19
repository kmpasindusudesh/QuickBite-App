import { StyleSheet } from 'react-native';
import { COLORS } from './LoginScreenStyles';

export { COLORS };

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        marginLeft: 10,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    // Restaurant card
    restCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 14,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 3,
    },
    restImage: {
        width: 90,
        height: 90,
    },
    restImagePlaceholder: {
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restInfo: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 4,
    },
    restName: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    restMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    restAddress: {
        fontSize: 13,
        color: COLORS.textSecondary,
        flex: 1,
    },
    restHours: {
        fontSize: 12,
        color: COLORS.textSecondary,
        flex: 1,
    },

    // Shared
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 50,
    },
    retryBtn: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
});
