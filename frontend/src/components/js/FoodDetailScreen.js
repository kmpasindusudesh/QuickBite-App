// React saha hooks import karanawa
import React from 'react';

// React Native components
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';

// Expo icons
import { Ionicons } from '@expo/vector-icons';

// Expo Router — navigation walata saha params gannawa
import { useLocalSearchParams, useRouter } from 'expo-router';

// Static file base URL
import { SERVER_URL } from '../../config';

// Styles saha COLORS
import styles, { COLORS } from '../css/FoodDetailScreenStyles';

// =====================================================
// FoodDetailScreen — Food item eke wishthara pennana screen eka
// Reviews add karana flow Reviews tab eke witharak — me screen eken duplicate naha
// =====================================================
export default function FoodDetailScreen() {

    // Expo router — back navigate karanawa
    const router = useRouter();

    // Home eken pass karana food params gannawa
    const params         = useLocalSearchParams();
    const foodName       = params.name          ? String(params.name)          : '';
    const foodPrice      = params.price         ? String(params.price)         : '';
    const foodImage      = params.image         ? String(params.image)         : '';
    const foodCat        = params.category      ? String(params.category)      : '';
    const foodDesc       = params.description   ? String(params.description)   : '';
    const restaurantName = params.restaurantName ? String(params.restaurantName) : '';

    // Food image full URL — SERVER_URL + path eka
    const imageUrl = foodImage ? (foodImage.startsWith('http') ? foodImage : SERVER_URL + '/' + String(foodImage).replace(/^\//, '')) : null;

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ---- Food Hero Image ---- */}
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.heroImage} />
                ) : (
                    <View style={styles.heroPlaceholder}>
                        <Ionicons name="fast-food-outline" size={64} color={COLORS.textSecondary} />
                    </View>
                )}

                {/* ---- Back Button — image eke float wenawa ---- */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>

                {/* ---- Food Info Box ---- */}
                <View style={styles.infoBox}>
                    <Text style={styles.foodName}>{foodName}</Text>

                    <View style={styles.foodMeta}>
                        <Text style={styles.foodCategory}>{foodCat}</Text>
                        <Text style={styles.foodPrice}>LKR {foodPrice}</Text>
                    </View>

                    {/* Restaurant name — thiyanam pennawa */}
                    {restaurantName !== '' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <Ionicons name="storefront-outline" size={15} color={COLORS.textSecondary} />
                            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                                {restaurantName}
                            </Text>
                        </View>
                    )}

                    {/* Description — thiyanam pennawa */}
                    {foodDesc !== '' && (
                        <Text style={styles.foodDescription}>{foodDesc}</Text>
                    )}
                </View>

            </ScrollView>
        </>
    );
}

/*
 * Mul sangrahaya (Sinhala):
 * Me screen eken food item eke details witharak pennawa — name, price, category, description.
 * Reviews tab eken community reviews balanna / post karanna — food detail eken duplicate flow naha.
 */
