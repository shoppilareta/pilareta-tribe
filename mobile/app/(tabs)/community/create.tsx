import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Button } from '@/components/ui';
import { createPost, getTags } from '@/api/community';

type PostMode = 'photo' | 'instagram';

export default function CreatePost() {
  const [mode, setMode] = useState<PostMode>('photo');
  const [image, setImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: tagsData } = useQuery({
    queryKey: ['community-tags'],
    queryFn: getTags,
  });

  const tags = tagsData?.tags ?? [];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      setImage({
        uri: asset.uri,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        name: `photo.${ext}`,
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      setImage({
        uri: asset.uri,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        name: `photo.${ext}`,
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const canSubmit =
    !submitting &&
    ((mode === 'photo' && image) || (mode === 'instagram' && instagramUrl.trim()));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      await createPost({
        file: mode === 'photo' ? image! : undefined,
        instagramUrl: mode === 'instagram' ? instagramUrl.trim() : undefined,
        caption: caption.trim() || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-my-posts'] });
      Alert.alert('Submitted!', 'Your post has been submitted for review.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode tabs */}
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setMode('photo')}
            style={[styles.modeTab, mode === 'photo' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'photo' && styles.modeTabTextActive]}>Photo</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('instagram')}
            style={[styles.modeTab, mode === 'instagram' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'instagram' && styles.modeTabTextActive]}>Instagram</Text>
          </Pressable>
        </View>

        {/* Photo mode */}
        {mode === 'photo' && (
          <View style={styles.mediaSection}>
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
                <Pressable onPress={() => setImage(null)} style={styles.removeImage}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={2}>
                    <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <Pressable onPress={pickImage} style={styles.photoButton}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                    <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.photoButtonText}>Choose Photo</Text>
                </Pressable>
                <Pressable onPress={takePhoto} style={styles.photoButton}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                    <Path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Instagram mode */}
        {mode === 'instagram' && (
          <View style={styles.mediaSection}>
            <Text style={styles.fieldLabel}>Instagram URL</Text>
            <TextInput
              style={styles.urlInput}
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              placeholder="https://instagram.com/p/..."
              placeholderTextColor={colors.fg.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text style={styles.fieldHint}>Paste a link to an Instagram post or reel</Text>
          </View>
        )}

        {/* Caption */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Share your experience..."
            placeholderTextColor={colors.fg.muted}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{caption.length}/1000</Text>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Tags</Text>
            <View style={styles.tagsGrid}>
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => toggleTag(tag.id)}
                    style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                  >
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                      {tag.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Guidelines */}
        <View style={styles.guidelines}>
          <Text style={styles.guidelinesText}>
            By posting, you agree to the community guidelines. Posts are reviewed before publishing.
          </Text>
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={styles.footer}>
        <Button
          title={submitting ? 'Submitting...' : 'Submit Post'}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  closeButton: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  modeRow: { flexDirection: 'row', backgroundColor: colors.bg.card, borderRadius: radius.md, padding: 3, marginBottom: spacing.lg },
  modeTab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  modeTabActive: { backgroundColor: colors.fg.primary },
  modeTabText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.secondary },
  modeTabTextActive: { color: colors.bg.primary },
  mediaSection: { marginBottom: spacing.lg },
  previewContainer: { position: 'relative', borderRadius: radius.md, overflow: 'hidden' },
  preview: { width: '100%', height: 300, borderRadius: radius.md },
  removeImage: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  photoButtons: { flexDirection: 'row', gap: spacing.md },
  photoButton: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, borderStyle: 'dashed', gap: spacing.sm },
  photoButtonText: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs },
  urlInput: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.fg.primary },
  fieldHint: { fontSize: typography.sizes.sm, color: colors.fg.muted, marginTop: spacing.xs },
  fieldSection: { marginBottom: spacing.lg },
  captionInput: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.fg.primary, minHeight: 100 },
  charCount: { fontSize: 11, color: colors.fg.muted, textAlign: 'right', marginTop: spacing.xs },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.default },
  tagChipSelected: { backgroundColor: colors.fg.primary, borderColor: colors.fg.primary },
  tagChipText: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  tagChipTextSelected: { color: colors.bg.primary },
  guidelines: { padding: spacing.md, backgroundColor: colors.cream05, borderRadius: radius.md },
  guidelinesText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, lineHeight: 18, textAlign: 'center' },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
});
