import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getToken, getUser } from '../../utils/storage';
import styles, { COLORS } from '../css/ManageRestaurantsScreenStyles';

// =====================================================
// ManageRestaurantsScreen — Member 2: list, edit navigation, delete (DELETE API)
// =====================================================
export default function ManageRestaurantsScreen() {
    const router = useRouter();

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isManager, setIsManager] = useState(true);

    useEffect(() => {
        (async () => {
            const u = await getUser();
            if (u && u.role !== 'manager') setIsManager(false);
        })();
    }, []);

    // =====================================================
    // loadRestaurants — GET /restaurants eken okkoma list eka gannawa (public read)
    // =====================================================
    const loadRestaurants = useCallback(async () => {
        setErrorMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/restaurants`);
            const data = await res.json().catch(() => []);
            if (!res.ok) {
                setErrorMsg(data.message || 'Failed to load restaurant list.');
                setRestaurants([]);
                return;
            }
            setRestaurants(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setErrorMsg(e?.message || 'Network error');
            setRestaurants([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Screen focus weddi list load — Profile/Edit eken back unoth refresh wenawa
    useFocusEffect(
        useCallback(() => {
            loadRestaurants();
        }, [loadRestaurants])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadRestaurants();
    };

    // =====================================================
    // handleDelete — Restaurant ekak delete karanna kalin kama thiyenawada balana thana
    // Backend 400 return karanawa linked food thibboth — me Alert ekata message enawa
    // JWT + Manager check — 403 naththam user warn karanawa
    // =====================================================
    const handleDelete = (item) => {
        Alert.alert(
            'Delete Restaurant',
            `Are you sure you want to permanently delete "${item.name}"?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            if (!token) {
                                Alert.alert('Login Required', 'Session expired. Please log in again.');
                                router.replace('/login');
                                return;
                            }

                            // DELETE request — JWT header eken manager check
                            const res = await fetch(`${API_BASE_URL}/restaurants/${item._id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            const data = await res.json().catch(() => ({}));

                            if (!res.ok) {
                                // Backend eken message eka — linked foods thibboth user ta explain wenawa
                                Alert.alert('Delete Failed', data.message || `Error ${res.status}`);
                                return;
                            }

                            // UI update — deleted item list eken remove karanawa
                            setRestaurants(prev => prev.filter(r => r._id !== item._id));
                            Alert.alert('Deleted', data.message || 'Restaurant deleted successfully.');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', e?.message || 'Network error');
                        }
                    },
                },
            ]
        );
    };

    const goEdit = (item) => {
        router.push({
            pathname: '/edit-restaurant',
            params: {
                id: String(item._id),
                name: String(item.name ?? ''),
                address: String(item.address ?? ''),
                workingHours: String(item.workingHours ?? ''),
                logo: String(item.logo ?? ''),
            },
        });
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
                }
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/profile')}>
                        <Ionicons name="arrow-back" size={26} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>Manage Restaurants</Text>
                </View>
                <Text style={styles.screenSubtitle}>Manage your restaurants — Edit or Delete</Text>

                {!isManager && (
                    <Text style={[styles.errorText, { textAlign: 'center' }]}>
                        This screen is for Managers only. Delete/Edit actions will result in a 403 error.
                    </Text>
                )}

                {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
                ) : restaurants.length === 0 ? (
                    <Text style={styles.emptyText}>No restaurants found. Use the Add Restaurant screen to get started.</Text>
                ) : (
                    restaurants.map((item) => {
                        const imageUrl = item.logo ? (item.logo.startsWith('http') ? item.logo : SERVER_URL + '/' + String(item.logo).replace(/^\//, '')) : null;
                        return (
                        <View key={String(item._id)} style={styles.card}>
                            <View style={styles.cardTop}>
                                {imageUrl ? (
                                    <Image source={{ uri: imageUrl }} style={styles.logoThumb} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.logoThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name="storefront-outline" size={28} color={COLORS.textSecondary} />
                                    </View>
                                )}
                                <View style={styles.cardTextCol}>
                                    <Text style={styles.restaurantName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.restaurantMeta} numberOfLines={2}>
                                        {item.address || '—'}
                                    </Text>
                                    <Text style={styles.restaurantMeta} numberOfLines={1}>
                                        {item.workingHours || 'Working hours not specified'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.actionsRow}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => goEdit(item)} activeOpacity={0.85}>
                                    <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.85}>
                                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                                    <Text style={styles.deleteBtnText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        );
                    })
                )}
            </ScrollView>
        </>
    );
}

/*
 * Mul sangrahaya (Sinhala):
 * GET eken list gannawa. Delete eken DELETE + JWT — confirm Alert eken. Edit eken params pass kara
 * Edit Restaurant screen ekata yawanawa. fetch witharak — Redux naha.
 */
