import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // Gallery eken photo ganna library eka

import { API_BASE_URL, SERVER_URL } from '../../config'; // API + static file base URL
import { getToken, clearAll, saveUser } from '../../utils/storage';
import styles, { COLORS, ROLE_COLORS } from '../css/ProfileScreenStyles';

// Manager log unama hari button eka ebuwama hari kelinma dashboard ekata yana widihata path eka haduwa. Parana add-food path eka ain kala.

// =====================================================
// profilePic URL eka hadanawa — DB eke "uploads/filename.jpg" wage thiyanawa
// SERVER_URL = http://IP:5000 — static route /uploads eken serve wenawa
// =====================================================
const getProfileImageUri = (user) => {
    return user?.profilePic ? (user.profilePic.startsWith('http') ? user.profilePic : SERVER_URL + '/' + String(user.profilePic).replace(/^\//, '')) : null;
};

export default function ProfileScreen() {

    const router = useRouter();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Edit modal
    const [editVisible, setEditVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    // Sri Lanka phone — 07XXXXXXXX wage 10 digits (edit modal ekata)
    const [editPhone, setEditPhone] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    // Delete loading
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Profile photo upload wenakotat spinner eka pennanna
    const [uploadingPic, setUploadingPic] = useState(false);

    // =====================================================
    // pickImage — Gallery open kara 1:1 crop saha photo ekak select karanna
    // =====================================================
    const pickImage = async () => {
        try {
            // Gallery access permission — Android/iOS rende walatamat ona
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.');
                return;
            }

            // launchImageLibraryAsync — user ta album eken photo ekak select karanna denawa
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Photos witharak
                allowsEditing: true,     // Crop / edit screen eka pennawa
                aspect: [1, 1],          // Square crop — profile pic ekata hondai
                quality: 0.85,           // File size eka kontrol karanawa
            });

            // User cancel karuwanam result.canceled true wenawa
            if (result.canceled || !result.assets || !result.assets[0]) {
                return;
            }

            const uri = result.assets[0].uri; // Local file path eka (file:// ...)
            await uploadImage(uri);
        } catch (e) {
            console.error('pickImage error:', e);
            Alert.alert('Error', e?.message || 'Failed to select photo. Please try again.');
        }
    };

    // =====================================================
    // uploadImage — profile photo upload (handleProfilePicUpdate wage me function eka)
    // FormData eken backend ekata photo eka yawanawa — field name 'image' = multer upload.single('image')
    // =====================================================
    const uploadImage = async (uri) => {
        setUploadingPic(true);
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/login');
                return;
            }

            // FormData — multipart/form-data body eka hadanawa
            const formData = new FormData();

            // React Native eke file append eka — uri, name, type denna ona
            const fileName = uri.split('/').pop() || 'profile.jpg';
            const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

            formData.append('image', {
                uri,
                name: fileName,
                type: mimeType,
            });

            // PUT /auth/profile-pic — Bearer token ona
            // IMPORTANT: Content-Type header eka MANUAL danna epa multipart ekata!
            // fetch + FormData use karanakotat runtime eka 'multipart/form-data; boundary=...'
            // automatically set karanawa — manual 'multipart/form-data' dapu boundary naththam
            // server eka body eka read karanna bari wei.
            const response = await fetch(`${API_BASE_URL}/auth/profile-pic`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                Alert.alert('Upload Failed', data.message || 'Failed to upload photo. Please try again.');
                return;
            }

            // Success — updated user object eka state eke update karanawa
            if (data.user) {
                setUser(data.user);
                // Update wechcha photo eka AsyncStorage ekata save karanawa — refresh ekata passe thamai photo path eka thiyenawa
                await saveUser({
                    id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    profilePic: data.user.profilePic || '',
                    phone: data.user.phone || '',
                });
            }

            Alert.alert('Success', data.message || 'Profile photo updated successfully.');
        } catch (e) {
            console.error('uploadImage error:', e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setUploadingPic(false);
        }
    };

    // ---------- Profile GET ----------
    const fetchProfile = async () => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            const token = await getToken();

            if (!token) {
                router.replace('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    await clearAll();
                    router.replace('/login');
                    return;
                }
                setErrorMsg(data.message || 'Failed to load profile data.');
                return;
            }

            setUser(data);
        } catch (error) {
            console.error('Profile fetch error:', error);
            setErrorMsg('Unable to connect to the server. Please check your network connection.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // ---------- UPDATE (PUT /auth/update) ----------
    // Name, Email, Phone change karanawa — fetch + useState
    const handleSaveEdit = async () => {
        if (!editName.trim() || !editEmail.trim()) {
            Alert.alert('Validation', 'Please enter your name and email address.');
            return;
        }

        // Sri Lanka mobile — 07XXXXXXXX wage exactly 10 digits — blank dinna puluwan (optional)
        if (editPhone.trim() && editPhone.trim().length !== 10) {
            Alert.alert('Validation', 'Phone number must be exactly 10 digits');
            return;
        }

        setSavingEdit(true);
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editName.trim(),
                    email: editEmail.trim().toLowerCase(),
                    phone: editPhone.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Update Failed', data.message || 'Failed to update profile. Please try again.');
                return;
            }

            // State update — screen eke witharak pennawa
            setUser(data.user);
            // AsyncStorage eken user cache eka update karanawa — phone field eka thamai dan add wune
            await saveUser({
                id: data.user._id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                profilePic: data.user.profilePic || '',
                phone: data.user.phone || '',
            });

            setEditVisible(false);
            Alert.alert('Success', data.message || 'Profile updated successfully.');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Network error');
        } finally {
            setSavingEdit(false);
        }
    };

    // ---------- DELETE (DELETE /auth/delete) ----------
    // Account ain kara — token clear kara Register ekata
    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This account will be permanently deleted. Are you sure you want to continue?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingAccount(true);
                        try {
                            const token = await getToken();
                            if (!token) {
                                await clearAll();
                                router.replace('/register');
                                return;
                            }

                            const response = await fetch(`${API_BASE_URL}/auth/delete`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            const data = await response.json().catch(() => ({}));

                            if (!response.ok) {
                                Alert.alert('Delete Failed', data.message || 'Failed to delete account. Please try again.');
                                return;
                            }

                            // Token + user data clear — Register screen ekata
                            await clearAll();
                            Alert.alert('Account Deleted', data.message || 'Your account has been deleted successfully.', [
                                { text: 'OK', onPress: () => router.replace('/register') },
                            ]);
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', e?.message || 'Network error');
                        } finally {
                            setDeletingAccount(false);
                        }
                    },
                },
            ]
        );
    };

    // Edit modal open — current values (name, email, phone) pre-fill karanawa
    const openEditModal = () => {
        if (user) {
            setEditName(user.name || '');
            setEditEmail(user.email || '');
            setEditPhone(user.phone || '');
            setEditVisible(true);
        }
    };

    // ---------- LOGOUT ----------
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAll();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    const getRoleBadgeStyle = (role) => {
        return ROLE_COLORS[role] || ROLE_COLORS.customer;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.errorContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <Ionicons name="cloud-offline-outline" size={64} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const roleStyle = getRoleBadgeStyle(user?.role);
    const imageUrl = getProfileImageUri(user);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />

            {/* Edit Profile Modal */}
            <Modal visible={editVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <Text style={styles.modalSubtitle}>Update your name, email, and phone number.</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Full Name"
                            placeholderTextColor={COLORS.textSecondary}
                            value={editName}
                            onChangeText={setEditName}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Email"
                            placeholderTextColor={COLORS.textSecondary}
                            value={editEmail}
                            onChangeText={setEditEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {/* Sri Lanka phone — 07XXXXXXXX wage 10 digits witharak (optional) */}
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Phone (e.g. 0712345678)"
                            placeholderTextColor={COLORS.textSecondary}
                            value={editPhone}
                            onChangeText={setEditPhone}
                            keyboardType="numeric"
                            maxLength={10}
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setEditVisible(false)}
                                disabled={savingEdit}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveBtn}
                                onPress={handleSaveEdit}
                                disabled={savingEdit}
                            >
                                {savingEdit ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.modalSaveText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.headerBanner}>
                    <View style={styles.avatarWrapper}>
                        {/* Avatar eka tap karakotat gallery open wenawa — photo upload karanna */}
                        <TouchableOpacity
                            style={styles.avatarTouchable}
                            onPress={pickImage}
                            disabled={uploadingPic}
                            activeOpacity={0.85}
                        >
                            <View style={styles.avatarCircle}>
                                {uploadingPic ? (
                                    <ActivityIndicator size="large" color={COLORS.accent} />
                                ) : imageUrl ? (
                                    // SERVER_URL + profilePic — upload karapu image eka pennawa
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Ionicons
                                        name="person-circle"
                                        size={72}
                                        color={COLORS.accent}
                                    />
                                )}
                                {/* Podi camera icon — meka tap karanna puluwan kiyala hint eka */}
                                {!uploadingPic && (
                                    <View style={styles.cameraBadge} pointerEvents="none">
                                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bodyContent}>

                    <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>

                    <View style={[
                        styles.roleBadge,
                        { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }
                    ]}>
                        <Ionicons
                            name={
                                user?.role === 'manager' ? 'briefcase-outline' :
                                user?.role === 'rider' ? 'bicycle-outline' :
                                'person-outline'
                            }
                            size={14}
                            color={roleStyle.text}
                        />
                        <Text style={[styles.roleBadgeText, { color: roleStyle.text }]}>
                            {user?.role || 'Customer'}
                        </Text>
                    </View>

                    {/* Manager Dashboard — restaurants + orders + reviews eka jagahe (Manager witharak) */}
                    {user?.role === 'manager' && (
                        <TouchableOpacity
                            style={styles.manageRestaurantsButton}
                            onPress={() => router.push('/manager-dashboard')}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="grid-outline" size={22} color={COLORS.accent} />
                            <Text style={styles.manageRestaurantsButtonText}>Manager Dashboard</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sectionTitle}>Account Info</Text>
                    <View style={styles.infoCard}>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="person-outline" size={20} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Full Name</Text>
                                <Text style={styles.infoValue}>{user?.name || '—'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{user?.email || '—'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="shield-outline" size={20} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Account Role</Text>
                                <Text style={[styles.infoValue, { color: roleStyle.text, textTransform: 'capitalize' }]}>
                                    {user?.role || '—'}
                                </Text>
                            </View>
                        </View>

                        {/* Phone row — Sri Lanka mobile 07XXXXXXXX (10 digits) */}
                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="call-outline" size={20} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                <Text style={styles.infoValue}>{user?.phone || '—'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <View style={styles.infoIconBox}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Member Since</Text>
                                <Text style={styles.infoValue}>
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                          })
                                        : '—'
                                    }
                                </Text>
                            </View>
                        </View>

                    </View>

                    <Text style={styles.sectionTitle}>Actions</Text>

                    {/* Edit Profile — PUT /auth/update */}
                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={openEditModal}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="create-outline" size={22} color={COLORS.accent} />
                        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    {/* Delete Account — DELETE /auth/delete */}
                    <TouchableOpacity
                        style={styles.deleteAccountButton}
                        onPress={handleDeleteAccount}
                        disabled={deletingAccount}
                        activeOpacity={0.85}
                    >
                        {deletingAccount ? (
                            <ActivityIndicator color={COLORS.error} />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                                <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.goBackButton}
                        onPress={() => {
                            // Manager — kelinma Manager Dashboard; customer/rider — Home
                            if (user?.role === 'manager') router.push('/manager-dashboard');
                            else router.push('/home');
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back-outline" size={20} color={COLORS.textPrimary} />
                        <Text style={styles.goBackButtonText}>Go Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </>
    );
}

/*
 * Mul sangrahaya (Sinhala) — Profile photo fix:
 * Photo upload success unama saveUser() eken profilePic path eka AsyncStorage ekata denawa;
 * e nisa app refresh / thawa screen walata gihin thamai updated photo eka use karanna puluwan.
 * fetch + useState witharak — advanced libraries naha.
 */
