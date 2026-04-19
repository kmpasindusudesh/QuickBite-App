// =====================================================
// (tabs)/_layout.js — Bottom Tab Bar Configuration (Role-based)
// Expo Router eke <Tabs> component eka use kara bottom navigation bar hadanawa
//
// ROLE-BASED TAB BAR:
//   Manager:  Home | Profile
//             (Cart/Orders/Reviews/RiderDash hide; Manager Dashboard = Profile eken access)
//   Customer: Home | Cart | Orders | Reviews | Profile
//   Rider:    Home | Deliveries (Rider Dashboard) | Profile
//             (Cart/Orders/Reviews hide)
//
// IMPORTANT CONCEPT — href: null
//   href: null = eka tab eka tab bar eken HIDE karanawa
//   Screen eka still exists (deep link / push eken access puluwan)
//   eg: Manager Dashboard = manager-dashboard screen exist; tab naha; Profile eken access
//
// IMPORTANT CONCEPT — Early render block
//   Role null wenakotat (AsyncStorage load wenakotat pera) Tabs render karanna epa!
//   Expo Router first render eke tab href values "lock" karanawa
//   null role ekata Tabs render kala naththam href values danima fix wenawa
//   Solution: role load wenana kotat spinner pennawa (ActivityIndicator)
// =====================================================

// React hooks — useState (role state), useEffect (AsyncStorage read)
import { useEffect, useState } from 'react';

// React Native components — loading spinner + container
import { View, ActivityIndicator } from 'react-native';

// Expo Router — Bottom tab navigator component
import { Tabs } from 'expo-router';

// Ionicons — Tab bar icons set (home-outline, cart-outline, etc.)
import { Ionicons } from '@expo/vector-icons';

// AsyncStorage — Phone eke local storage; login kara save karapu user data gannawa
import AsyncStorage from '@react-native-async-storage/async-storage';

// USER_KEY — storage.js eke widihata same key eka (duplicate typo avoid)
// Me key eken user JSON object eka save + read wenawa
const USER_KEY = 'quickbite_user';

// =====================================================
// TabsLayout — Default export; Expo Router auto use karanawa
// =====================================================
export default function TabsLayout() {

    // role state — 'manager' | 'customer' | 'rider' | null
    // null = AsyncStorage load wenakotat (spinner stage)
    // setState wenakotat component re-render → Tabs correct role eka anuwa pennawa
    const [role, setRole] = useState(null);

    // =====================================================
    // useEffect — Component mount wenakotat eka witirak run
    // AsyncStorage eken user data gena role eka gannawa
    // =====================================================
    useEffect(() => {
        // mounted flag — unmount wela thibboth state update crash avoid
        let mounted = true;

        const fetchRoleFromStorage = async () => {
            try {
                // 1. AsyncStorage eken user JSON string gannawa
                const jsonString = await AsyncStorage.getItem(USER_KEY);

                // 2. Component unmount wela naththam return (cleanup)
                if (!mounted) return;

                if (jsonString) {
                    // 3. JSON.parse → object ekata convert
                    const user = JSON.parse(jsonString);

                    // 4. role eka lowercase trim kara normalize
                    // Eg: 'Manager' → 'manager' (DB value match)
                    const resolvedRole = (user.role || 'customer').toLowerCase().trim();
                    setRole(resolvedRole);
                } else {
                    // 5. User data naha (login naha) → default customer role
                    setRole('customer');
                }
            } catch (e) {
                console.error('AsyncStorage read error:', e);
                // Error nam default customer (crash prevent)
                if (mounted) setRole('customer');
            }
        };

        fetchRoleFromStorage();

        // Cleanup function — useEffect return value
        // Component unmount wenakotat mounted = false set wenawa
        return () => {
            mounted = false;
        };
    }, []); // [] = dependency array empty → mount eka witirak run

    // =====================================================
    // Loading state — role null wenakotat spinner pennawa
    // Tabs early render prevent karanawa
    // =====================================================
    if (role === null) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0A0F0A', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00C853" />
            </View>
        );
    }

    // Role boolean flags — tab visibility logic
    const isManager = role === 'manager';
    const isRider   = role === 'rider';
    // Customer-only tabs = not manager + not rider
    const showCustomerTabs = !isManager && !isRider;

    // =====================================================
    // <Tabs> — Expo Router bottom tab navigator
    // screenOptions — global styling okkoma tabs walata
    // =====================================================
    return (
        <Tabs
            screenOptions={{
                headerShown: false,               // Screen eke top header hide (custom headers use karanawa)
                tabBarStyle: {
                    backgroundColor: '#0A0F0A',   // Dark background (LoginScreenStyles COLORS match)
                    borderTopColor: '#2A3A2A',     // Green-tinted border
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: '#00C853',  // Active tab = emerald green
                tabBarInactiveTintColor: '#A0A0A0', // Inactive tab = grey
            }}
        >
            {/* ====== HOME — Okkoma roles ====== */}
            {/* Manager, Customer, Rider tun denekutama pennawa */}
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    href: '/home', // Always visible — no role restriction
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== ADD FOOD — Tab bar hide; Manager Dashboard eke embedded ====== */}
            {/* href: null = tab bar eken naha; screen still accessible */}
            <Tabs.Screen
                name="add-food"
                options={{
                    title: 'Add Food',
                    href: null, // Always hidden from tab bar
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="restaurant-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== ADD RESTAURANT — Tab bar hide; Manager Dashboard embedded ====== */}
            <Tabs.Screen
                name="add-restaurant"
                options={{
                    title: 'Add Rest.',
                    href: null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="storefront-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== EDIT FOOD — Tab bar hide; Manager Dashboard push karanawa ====== */}
            <Tabs.Screen
                name="edit-food"
                options={{ href: null }}
            />

            {/* ====== RESTAURANT DETAIL — Tab bar hide; Home eken tap karakotat ====== */}
            <Tabs.Screen
                name="restaurant-detail"
                options={{ href: null }}
            />

            {/* ====== MANAGER DASHBOARD — Tab bar hide; Profile screen eken navigate ====== */}
            {/* Manager ge tabs bar eke pennawa naha — Profile → "Manager Dashboard" button */}
            <Tabs.Screen
                name="manager-dashboard"
                options={{ href: null }}
            />

            {/* ====== FOOD DETAIL — Tab bar hide; Restaurant Detail eken tap ====== */}
            {/* Member 6 reviews + Member 3 food details pennawa */}
            <Tabs.Screen
                name="food-detail"
                options={{ href: null }}
            />

            {/* ====== MANAGE/EDIT RESTAURANT — Tab bar hide; Profile eken navigate ====== */}
            <Tabs.Screen
                name="manage-restaurants"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="edit-restaurant"
                options={{ href: null }}
            />

            {/* ====== CART — Customer witharak (Manager + Rider hide) ====== */}
            {/* Member 4: Food items cart ekata add kara checkout karanawa */}
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    href: showCustomerTabs ? '/cart' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== ORDERS — Customer witharak (Manager + Rider hide) ====== */}
            {/* Member 4: Customer ge order history + edit/cancel (Pending witharak) */}
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    href: showCustomerTabs ? '/orders' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== RIDER DASHBOARD — Rider witharak ====== */}
            {/* Member 5: Available orders + active delivery task */}
            <Tabs.Screen
                name="rider-dashboard"
                options={{
                    title: 'Deliveries',
                    href: isRider ? '/rider-dashboard' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bicycle-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== REVIEWS — Customer witharak ====== */}
            {/* Member 6: Food reviews add + global feed balanna */}
            <Tabs.Screen
                name="reviews"
                options={{
                    title: 'Reviews',
                    href: showCustomerTabs ? '/reviews' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="star-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ====== PROFILE — Okkoma roles ====== */}
            {/* Member 1: Profile edit + logout; Manager: Dashboard link */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Tab bar role logic:
 *   role = AsyncStorage eken gannawa (login kala passe save wela)
 *   null → spinner (Tabs early render prevent)
 *   manager → Home | Profile
 *   rider → Home | Deliveries | Profile
 *   customer → Home | Cart | Orders | Reviews | Profile
 *
 * href: null use cases:
 *   Add Food, Add Restaurant → Manager Dashboard embedded (tab bar naha)
 *   Edit Food, Edit Restaurant → deep link / push navigation
 *   Restaurant Detail, Food Detail → Home eken navigate
 *   Manager Dashboard → Profile eken button
 *
 * Members' screens:
 *   Member 1 → profile
 *   Member 2 → add-restaurant, edit-restaurant, manage-restaurants
 *   Member 3 → add-food, edit-food
 *   Member 4 → cart, orders, home (restaurant + food list)
 *   Member 5 → rider-dashboard
 *   Member 6 → reviews, food-detail
 */
