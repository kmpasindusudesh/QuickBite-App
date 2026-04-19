// React saha hooks import karanawa
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    StatusBar,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL, SERVER_URL } from '../../config';
import { getToken, getUser } from '../../utils/storage';

import styles, { COLORS } from '../css/ReviewScreenStyles';

// Unexpected field error eka sampurnayen ain karanna frontend header ekai backend middleware field ekai match kala.
// Field name: 'reviewImage'  ←  must match  →  upload.single('reviewImage') in reviewRoutes.js
const REVIEW_IMAGE_FORM_FIELD = 'reviewImage';

// Member 6: Food ekak select karanne nathuwa general review ekak danna puluwan widihata
// logic eka update kala. Meka app eke general feedback system eka widihata wada karanawa.
// =====================================================
// ReviewScreen — General Feedback tab: inline feedback form + global feed (GET /api/reviews)
// =====================================================
export default function ReviewScreen() {

    const router = useRouter();

    const [rating, setRating]       = useState(0);
    const [comment, setComment]     = useState('');
    const [image, setImage]         = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg]   = useState('');

    const [reviews, setReviews]               = useState([]);
    const [avgRating, setAvgRating]           = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editReviewId, setEditReviewId]       = useState(null);
    const [editModalRating, setEditModalRating] = useState(0);
    const [editModalComment, setEditModalComment] = useState('');
    const [editModalError, setEditModalError]   = useState('');
    const [editSaving, setEditSaving]           = useState(false);

    const [currentUserId, setCurrentUserId] = useState('');
    const [currentRole, setCurrentRole]     = useState('customer');

    useEffect(() => {
        (async () => {
            const u = await getUser();
            if (u) {
                setCurrentUserId(String(u.id || ''));
                setCurrentRole(u.role || 'customer');
            }
        })();
    }, []);

    const loadReviews = useCallback(async () => {
        setLoadingReviews(true);
        try {
            const res  = await fetch(`${API_BASE_URL}/reviews`);
            const data = await res.json().catch(() => ({}));
            if (res.ok && Array.isArray(data)) {
                setReviews(data);
                if (data.length > 0) {
                    const sum = data.reduce((s, r) => s + (Number(r.rating) || 0), 0);
                    setAvgRating((sum / data.length).toFixed(1));
                } else {
                    setAvgRating(null);
                }
            } else {
                setReviews([]);
                setAvgRating(null);
            }
        } catch (e) {
            console.error(e);
            setReviews([]);
            setAvgRating(null);
        } finally {
            setLoadingReviews(false);
        }
    }, []);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    useFocusEffect(
        useCallback(() => {
            loadReviews();
        }, [loadReviews])
    );

    const pickImage = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Please grant permission to access your photo gallery.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.85,
            });
            if (result.canceled || !result.assets?.[0]) return;
            setImage(result.assets[0].uri);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to select photo. Please try again.');
        }
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
        setEditReviewId(null);
        setEditModalRating(0);
        setEditModalComment('');
        setEditModalError('');
        setEditSaving(false);
    };

    const openEditModal = (review) => {
        setEditReviewId(String(review._id));
        setEditModalRating(Number(review.rating) || 1);
        setEditModalComment(review.comment || '');
        setEditModalError('');
        setEditModalVisible(true);
    };

    const handleSaveEditModal = async () => {
        setEditModalError('');
        if (!editReviewId) return;
        if (editModalRating < 1 || editModalRating > 5) {
            setEditModalError('Please select a rating between 1 and 5.');
            return;
        }

        setEditSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Login Required', 'Please log in to edit your review.');
                setEditSaving(false);
                return;
            }

            const formData = new FormData();
            formData.append('rating', String(editModalRating));
            formData.append('comment', editModalComment.trim());

            const res  = await fetch(`${API_BASE_URL}/reviews/${editReviewId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setEditModalError(data.message || `Error ${res.status}`);
                return;
            }

            closeEditModal();
            loadReviews();
            Alert.alert('Success', data.message || 'Review updated successfully.');
        } catch (e) {
            console.error(e);
            setEditModalError(e?.message || 'Network error');
        } finally {
            setEditSaving(false);
        }
    };

    const handlePostReview = async () => {
        setErrorMsg('');

        if (currentRole === 'manager') {
            Alert.alert('Access Restricted', 'Managers are not permitted to submit feedback from this page.');
            return;
        }

        if (rating === 0) {
            Alert.alert('Validation', 'Star rating ekak select karanna (1-5)!');
            return;
        }

        setSubmitting(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Login Required', 'Please log in to submit a review.');
                return;
            }

            const formData = new FormData();
            formData.append('rating',  String(rating));
            formData.append('comment', comment.trim());
            if (image) {
                const fileName = image.split('/').pop() || 'review.jpg';
                const ext      = (fileName.split('.').pop() || 'jpg').toLowerCase();
                const mime     = ext === 'png' ? 'image/png' : 'image/jpeg';
                // REVIEW_IMAGE_FORM_FIELD = 'reviewImage' — must match upload.single('reviewImage')
                formData.append(REVIEW_IMAGE_FORM_FIELD, { uri: image, name: fileName, type: mime });
            }

            // Content-Type header manual danna epa — FormData boundary React Native eken auto set wenawa
            const res  = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }, // Content-Type — set naha (multipart boundary auto)
                body: formData,
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErrorMsg(data.message || `Error ${res.status}`);
                return;
            }

            Alert.alert('Success', data.message || 'Feedback submitted successfully! ⭐');
            setRating(0);
            setComment('');
            setImage(null);
            loadReviews();
        } catch (e) {
            console.error(e);
            setErrorMsg(e?.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (reviewId) => {
        Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await getToken();
                        if (!token) return;
                        const res  = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                                Alert.alert('Error', data.message || 'Failed to delete review. Please try again.');
                            return;
                        }
                                Alert.alert('Deleted', 'Review deleted successfully.');
                        loadReviews();
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Error', e?.message || 'Network error');
                    }
                },
            },
        ]);
    };

    const buildStars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginRight: 10, padding: 6 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.screenTitle}>General Feedback</Text>
                        <Text style={styles.screenSubtitle}>Share your experience with QuickBite</Text>
                    </View>
                </View>

                {currentRole !== 'manager' && (
                    <View style={styles.addReviewSection}>
                        <Text style={styles.addReviewTitle}>Share Your Feedback</Text>
                        {errorMsg !== '' && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        )}
                        <Text style={styles.label}>Your rating</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    style={[styles.starBtn, rating >= star && styles.starBtnActive]}
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[styles.starBtnText, rating >= star && styles.starBtnTextActive]}>
                                        {star}★
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.label}>Comment</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write about your experience..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            maxLength={500}
                        />

                        <TouchableOpacity
                            style={styles.addPhotoBtn}
                            onPress={pickImage}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="image-outline" size={20} color={COLORS.accent} />
                            <Text style={styles.addPhotoBtnText}>Add Photo</Text>
                        </TouchableOpacity>

                        {image && (
                            <View style={styles.reviewPhotoPreviewWrap}>
                                <Image source={{ uri: image }} style={styles.reviewPhotoThumb} />
                                <TouchableOpacity
                                    style={styles.reviewPhotoRemove}
                                    onPress={() => setImage(null)}
                                    hitSlop={8}
                                >
                                    <Ionicons name="close-circle" size={26} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.postReviewBtn, submitting && styles.submitBtnDisabled]}
                            onPress={handlePostReview}
                            disabled={submitting}
                            activeOpacity={0.9}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.postReviewBtnText}>Post Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.divider} />

                {avgRating && (
                    <View style={styles.avgChip}>
                        <Text style={styles.avgNumber}>{avgRating}</Text>
                        <View>
                            <Text style={{ color: COLORS.accent, fontSize: 17 }}>
                                {buildStars(parseFloat(avgRating))}
                            </Text>
                            <Text style={styles.avgLabel}>
                                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Community Feedback</Text>

                {loadingReviews ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={COLORS.accent} />
                    </View>
                ) : reviews.length === 0 ? (
                    <Text style={styles.emptyText}>No feedback yet. Be the first to share! ⭐</Text>
                ) : (
                    reviews.map((review) => {
                            const imageUrl = review.image ? (review.image.startsWith('http') ? review.image : SERVER_URL + '/' + String(review.image).replace(/^\//, '')) : null;

                        const isOwner =
                            currentUserId &&
                            String(review.userId?._id || review.userId) === currentUserId;
                        const canDelete = currentRole === 'manager' || isOwner;
                        const canEdit   = isOwner && currentRole !== 'manager';

                        // foodId thiyanam food name pennawa; naththam general feedback label pennawa
                        const foodLabel = review.foodId?.name || 'General Feedback';

                        return (
                            <View key={String(review._id)} style={styles.feedCard}>
                                <View style={styles.feedFoodRow}>
                                    <Ionicons
                                        name={review.foodId?.name ? 'restaurant-outline' : 'chatbubble-outline'}
                                        size={16}
                                        color={COLORS.accent}
                                    />
                                    <Text style={styles.feedFoodName} numberOfLines={1}>
                                        {foodLabel}
                                    </Text>
                                </View>

                                <View style={styles.reviewTop}>
                                    <Text style={styles.reviewerName}>
                                        {review.userId?.name || 'Customer'}
                                    </Text>
                                    <Text style={styles.reviewStars}>
                                        {buildStars(review.rating)}
                                    </Text>
                                </View>

                                {review.comment !== '' && (
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                )}

                                {imageUrl && (
                                    <Image source={{ uri: imageUrl }} style={styles.reviewImg} />
                                )}

                                <Text style={styles.reviewDate}>
                                    {review.createdAt
                                        ? new Date(review.createdAt).toLocaleDateString('en-GB', {
                                              day: '2-digit', month: 'short', year: 'numeric',
                                          })
                                        : ''}
                                </Text>

                                {(canEdit || canDelete) && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end',
                                        gap: 8, marginTop: 8 }}>
                                        {canEdit && (
                                            <TouchableOpacity
                                                style={styles.editIconBtn}
                                                onPress={() => openEditModal(review)}
                                                activeOpacity={0.75}
                                                accessibilityLabel="Edit review"
                                            >
                                                <Ionicons name="pencil-outline" size={18} color={COLORS.accent} />
                                            </TouchableOpacity>
                                        )}
                                        {canDelete && (
                                            <TouchableOpacity
                                                style={styles.deleteBtn}
                                                onPress={() => handleDelete(String(review._id))}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                                                <Text style={styles.deleteBtnText}>Delete</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeEditModal}
            >
                <View style={styles.editModalRoot}>
                    <TouchableOpacity
                        style={styles.editModalDismissArea}
                        activeOpacity={1}
                        onPress={closeEditModal}
                    />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.editModalKeyboard}
                    >
                        <View style={styles.editModalSheet}>
                            <View style={styles.editModalGrabRow}>
                                <Text style={styles.editModalTitle}>Edit your review</Text>
                                <TouchableOpacity onPress={closeEditModal} hitSlop={12}>
                                    <Ionicons name="close" size={26} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Rating</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        style={[styles.starBtn, editModalRating >= star && styles.starBtnActive]}
                                        onPress={() => setEditModalRating(star)}
                                        activeOpacity={0.75}
                                    >
                                        <Text
                                            style={[
                                                styles.starBtnText,
                                                editModalRating >= star && styles.starBtnTextActive,
                                            ]}
                                        >
                                            {star}★
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Comment</Text>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Update your comment..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={editModalComment}
                                onChangeText={setEditModalComment}
                                multiline
                                maxLength={500}
                            />

                            {editModalError !== '' && (
                                <Text style={styles.editModalErrorText}>{editModalError}</Text>
                            )}

                            <View style={styles.editModalActions}>
                                <TouchableOpacity
                                    style={styles.editModalCancelBtn}
                                    onPress={closeEditModal}
                                    disabled={editSaving}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.editModalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.editModalSaveBtn, editSaving && styles.submitBtnDisabled]}
                                    onPress={handleSaveEditModal}
                                    disabled={editSaving}
                                    activeOpacity={0.9}
                                >
                                    {editSaving ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.editModalSaveText}>Save Changes</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </>
    );
}
