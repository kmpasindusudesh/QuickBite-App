// =====================================================
// HomeScreen.js — Member 2 + 3: Customer Home
// Restaurant list eka pennawa (Master-Detail pattern)
//
// Flow:
//   GET /api/restaurants → restaurant cards render
//   Tap card → RestaurantDetailScreen (id, name, address, workingHours, logo pass)
//   RestaurantDetailScreen → GET /api/food → filter by restaurantId → menu
//
// Members:
//   Member 2 — GET /api/restaurants (getAllRestaurants)
//   Member 3 — RestaurantDetailScreen eke food filter + FoodDetailScreen
// =====================================================
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { API_BASE_URL, SERVER_URL } from '../../config';
import styles, { COLORS } from '../css/HomeStyles';

export default function HomeScreen() {
    const router = useRouter();

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [errorMsg, setErrorMsg]       = useState('');
    const [search, setSearch]           = useState('');

    // =====================================================
    // loadRestaurants — GET /api/restaurants (public; no token)
    // =====================================================
    const loadRestaurants = useCallback(() => {
        setLoading(true);
        setErrorMsg('');
        fetch(`${API_BASE_URL}/restaurants`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setRestaurants(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error('HomeScreen fetch error:', err.message);
                setErrorMsg('Failed to load restaurants. Please check your network connection.');
                setRestaurants([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Screen focus weddi refresh — alut restaurant add unath pennenne
    useFocusEffect(
        useCallback(() => {
            loadRestaurants();
        }, [loadRestaurants])
    );

    // =====================================================
    // handleRestaurantPress — RestaurantDetailScreen ekata navigate
    // Params: id, name, address, workingHours, logo path
    // RestaurantDetailScreen eke useLocalSearchParams() eken genawa
    // =====================================================
    const handleRestaurantPress = (item) => {
        router.push({
            pathname: '/restaurant-detail',
            params: {
                id:           String(item._id),
                _id:          String(item._id),
                name:         String(item.name        ?? ''),
                address:      String(item.address     ?? ''),
                workingHours: String(item.workingHours ?? ''),
                logo:         String(item.logo         ?? ''),
            },
        });
    };

    // Search filter — name hari address eke lowercase match
    const filtered = restaurants.filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            String(r.name    ?? '').toLowerCase().includes(q) ||
            String(r.address ?? '').toLowerCase().includes(q)
        );
    });

    // =====================================================
    // Restaurant card render
    // =====================================================
    const renderItem = ({ item }) => {
        const imageUrl = item.logo ? (item.logo.startsWith('http') ? item.logo : SERVER_URL + '/' + String(item.logo).replace(/^\//, '')) : null;

        return (
            <TouchableOpacity
                style={styles.restCard}
                onPress={() => handleRestaurantPress(item)}
                activeOpacity={0.85}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.restImage} />
                ) : (
                    <View style={[styles.restImage, styles.restImagePlaceholder]}>
                        <Ionicons name="storefront-outline" size={36} color={COLORS.textSecondary} />
                    </View>
                )}

                <View style={styles.restInfo}>
                    <Text style={styles.restName} numberOfLines={1}>{item.name}</Text>

                    {item.address ? (
                        <View style={styles.restMetaRow}>
                            <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                            <Text style={styles.restAddress} numberOfLines={1}>{item.address}</Text>
                        </View>
                    ) : null}

                    {item.workingHours ? (
                        <View style={styles.restMetaRow}>
                            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
                            <Text style={styles.restHours} numberOfLines={1}>{item.workingHours}</Text>
                        </View>
                    ) : null}
                </View>

                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
        );
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <FlatList
                style={styles.container}
                contentContainerStyle={[
                    styles.listContent,
                    { flexGrow: 1 },
                ]}
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>QuickBite 🍔</Text>
                            <Text style={styles.subtitle}>What are you craving today? 👇</Text>
                        </View>

                        {/* Search bar */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search restaurants..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={search}
                                onChangeText={setSearch}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                }
                data={filtered}
                keyExtractor={(item) => String(item._id)}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={loadRestaurants}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={COLORS.accent} />
                        </View>
                    ) : errorMsg ? (
                        <View style={styles.center}>
                            <Ionicons name="wifi-outline" size={48} color={COLORS.textSecondary} />
                            <Text style={[styles.emptyText, { marginTop: 12 }]}>{errorMsg}</Text>
                            <TouchableOpacity style={styles.retryBtn} onPress={loadRestaurants}>
                                <Text style={{ color: COLORS.accent }}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'No restaurants found. Try a different search.' : 'No restaurants available. Ask a manager to add some!'}
                        </Text>
                    )
                }
                showsVerticalScrollIndicator={false}
            />
        </>
    );
}
