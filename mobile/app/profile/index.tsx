import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { profileApi, apiFetch } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import type { UserProfile } from '@shared/types';

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general', label: 'General Fitness' },
] as const;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState('');
  const [weeklyCalorieTarget, setWeeklyCalorieTarget] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<string | null>(null);

  const populateForm = useCallback((profile: UserProfile) => {
    setDisplayName(profile.displayName || '');
    setBio(profile.bio || '');
    setAvatarUrl(profile.avatarUrl || null);
    setWeight(profile.weight != null ? String(profile.weight) : '');
    setHeight(profile.height != null ? String(profile.height) : '');
    setAge(profile.age != null ? String(profile.age) : '');
    setDailyCalorieTarget(
      profile.dailyCalorieTarget != null ? String(profile.dailyCalorieTarget) : ''
    );
    setWeeklyCalorieTarget(
      profile.weeklyCalorieTarget != null ? String(profile.weeklyCalorieTarget) : ''
    );
    setFitnessGoal(profile.fitnessGoal || null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const { profile } = await profileApi.getProfile();
      populateForm(profile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [populateForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAvatarPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
        await apiFetch('/api/user/profile/avatar', { method: 'POST', body: formData });
        await fetchProfile();
        setUploadingAvatar(false);
      }
    } catch {
      setUploadingAvatar(false);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    }
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || displayName?.[0] || user?.email?.[0] || '?';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age, 10) : null,
        dailyCalorieTarget: dailyCalorieTarget ? parseInt(dailyCalorieTarget, 10) : null,
        weeklyCalorieTarget: weeklyCalorieTarget ? parseInt(weeklyCalorieTarget, 10) : null,
        fitnessGoal: fitnessGoal,
      };

      // Basic client-side validation
      if (data.weight !== null && (isNaN(data.weight as number) || (data.weight as number) <= 0)) {
        Alert.alert('Invalid Input', 'Please enter a valid weight.');
        setSaving(false);
        return;
      }
      if (data.height !== null && (isNaN(data.height as number) || (data.height as number) <= 0)) {
        Alert.alert('Invalid Input', 'Please enter a valid height.');
        setSaving(false);
        return;
      }
      if (data.age !== null && (isNaN(data.age as number) || (data.age as number) < 1)) {
        Alert.alert('Invalid Input', 'Please enter a valid age.');
        setSaving(false);
        return;
      }
      if (data.dailyCalorieTarget !== null && (isNaN(data.dailyCalorieTarget as number) || (data.dailyCalorieTarget as number) < 0)) {
        Alert.alert('Invalid Input', 'Please enter a valid daily calorie target.');
        setSaving(false);
        return;
      }
      if (data.weeklyCalorieTarget !== null && (isNaN(data.weeklyCalorieTarget as number) || (data.weeklyCalorieTarget as number) < 0)) {
        Alert.alert('Invalid Input', 'Please enter a valid weekly calorie target.');
        setSaving(false);
        return;
      }

      const { profile } = await profileApi.updateProfile(data);
      populateForm(profile);
      showToast('Profile updated successfully', 'success');
    } catch (error: any) {
      if (error?.name === 'NetworkError') {
        showToast('No internet connection. Please check your network.', 'error');
      } else {
        const message = error?.data?.error || 'Failed to save profile. Please try again.';
        showToast(message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handleAvatarPress} disabled={uploadingAvatar} style={styles.avatarContainer}>
              {uploadingAvatar ? (
                <View style={styles.avatarCircle}>
                  <ActivityIndicator color={colors.fg.primary} />
                </View>
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarCircle} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.button.primaryText} strokeWidth={2}>
                  <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your display name"
                  placeholderTextColor={colors.fg.disabled}
                  maxLength={100}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.fg.disabled}
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{bio.length}/500</Text>
              </View>
            </View>
          </View>

          {/* Body Measurements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <View style={styles.card}>
              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="e.g. 65"
                    placeholderTextColor={colors.fg.disabled}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="e.g. 170"
                    placeholderTextColor={colors.fg.disabled}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="e.g. 28"
                  placeholderTextColor={colors.fg.disabled}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Calorie Targets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calorie Targets</Text>
            <View style={styles.card}>
              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Daily (kcal)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyCalorieTarget}
                    onChangeText={setDailyCalorieTarget}
                    placeholder="e.g. 2000"
                    placeholderTextColor={colors.fg.disabled}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Weekly (kcal)</Text>
                  <TextInput
                    style={styles.input}
                    value={weeklyCalorieTarget}
                    onChangeText={setWeeklyCalorieTarget}
                    placeholder="e.g. 14000"
                    placeholderTextColor={colors.fg.disabled}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Fitness Goal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Goal</Text>
            <View style={styles.card}>
              {FITNESS_GOALS.map((goal, index) => (
                <View key={goal.value}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    style={styles.goalRow}
                    onPress={() =>
                      setFitnessGoal(fitnessGoal === goal.value ? null : goal.value)
                    }
                  >
                    <Text
                      style={[
                        styles.goalLabel,
                        fitnessGoal === goal.value && styles.goalLabelSelected,
                      ]}
                    >
                      {goal.label}
                    </Text>
                    <View
                      style={[
                        styles.radioOuter,
                        fitnessGoal === goal.value && styles.radioOuterSelected,
                      ]}
                    >
                      {fitnessGoal === goal.value && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.button.primaryText} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  closeText: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 60,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.fg.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
  },
  fieldGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bg.input,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.sizes.base,
    color: colors.fg.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    color: colors.fg.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.sm,
  },
  rowFields: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  goalLabel: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
  },
  goalLabelSelected: {
    color: colors.fg.primary,
    fontWeight: typography.weights.medium,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.hover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.accent.amber,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.amber,
  },
  saveButton: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cream10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.button.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg.primary,
  },
  avatarHint: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    marginTop: spacing.xs,
  },
});
