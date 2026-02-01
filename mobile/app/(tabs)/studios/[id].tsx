import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Linking, TextInput, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, Button } from '@/components/ui';
import { getStudio } from '@/api/studios';
import { apiFetch } from '@/api/client';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_HEIGHT = 200;

type DetailTab = 'info' | 'claim' | 'suggest';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatOpeningHours(openingHours: unknown): string[] {
  if (!openingHours || typeof openingHours !== 'object') return [];

  const oh = openingHours as Record<string, unknown>;

  // Google Places format: { weekday_text: string[] }
  if (Array.isArray(oh.weekday_text)) {
    return oh.weekday_text.map(String);
  }

  // Google Places format: { periods: Array<{ open: { day, time }, close: { day, time } }> }
  if (Array.isArray(oh.periods)) {
    const dayHours: Record<number, string> = {};
    for (const period of oh.periods) {
      const p = period as Record<string, any>;
      const openDay = p.open?.day;
      const openTime = p.open?.time;
      const closeTime = p.close?.time;

      if (openDay == null || !openTime) continue;

      const fmtTime = (t: string) => {
        const h = parseInt(t.slice(0, 2), 10);
        const m = t.slice(2);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${m} ${ampm}`;
      };

      const dayName = DAY_NAMES[openDay] || `Day ${openDay}`;
      const timeStr = closeTime ? `${fmtTime(openTime)} - ${fmtTime(closeTime)}` : `${fmtTime(openTime)} - Open`;
      dayHours[openDay] = dayHours[openDay] ? `${dayHours[openDay]}, ${timeStr}` : timeStr;
    }

    return DAY_NAMES.map((name, i) => `${name}: ${dayHours[i] || 'Closed'}`);
  }

  // Simple object format: { Monday: "9:00 - 17:00", ... }
  if (!Array.isArray(oh)) {
    const entries = Object.entries(oh).filter(([k]) => k !== 'open_now' && k !== 'periods');
    if (entries.length > 0) {
      return entries.map(([day, hours]) => `${day}: ${typeof hours === 'string' ? hours : 'See website'}`);
    }
  }

  // Array of strings
  if (Array.isArray(openingHours)) {
    return openingHours.filter(item => typeof item === 'string').map(String);
  }

  return [];
}

function getPhotoUrl(photos: unknown): string | null {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const first = photos[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') {
    const p = first as Record<string, unknown>;
    if (typeof p.url === 'string') return p.url;
    if (typeof p.photo_reference === 'string') {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${p.photo_reference}&key=AIzaSyAU6a_TTpb_lAepYeVxKI9oB1TIkpze3fM`;
    }
  }
  return null;
}

export default function StudioDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('info');

  const { data, isLoading } = useQuery({
    queryKey: ['studio-detail', id],
    queryFn: () => getStudio(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  const studio = data?.studio;
  if (!studio) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Studio not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = getPhotoUrl(studio.photos);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{studio.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['info', 'claim', 'suggest'] as DetailTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'info' ? 'Details' : tab === 'claim' ? 'Claim' : 'Suggest Edit'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && <StudioInfo studio={studio} photoUrl={photoUrl} />}
        {activeTab === 'claim' && <ClaimForm studioId={studio.id} />}
        {activeTab === 'suggest' && <SuggestEditForm studioId={studio.id} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudioInfo({ studio, photoUrl }: { studio: NonNullable<Awaited<ReturnType<typeof getStudio>>['studio']>; photoUrl: string | null }) {
  const hours = formatOpeningHours(studio.openingHours);

  return (
    <>
      {/* Photo */}
      {photoUrl && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
        </View>
      )}

      {/* Rating */}
      {studio.rating != null && (
        <View style={styles.ratingRow}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="rgba(234, 179, 8, 0.8)" stroke="none">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </Svg>
          <Text style={styles.ratingText}>{studio.rating.toFixed(1)}</Text>
          {studio.ratingCount != null && <Text style={styles.ratingCount}>({studio.ratingCount} reviews)</Text>}
          {studio.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      )}

      {/* Address */}
      {(studio.formattedAddress || studio.address) && (
        <InfoRow
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
          text={studio.formattedAddress || studio.address!}
          onPress={() => {
            const addr = encodeURIComponent(studio.formattedAddress || studio.address || studio.name);
            Linking.openURL(`https://maps.google.com/?q=${addr}`);
          }}
        />
      )}

      {/* Phone */}
      {studio.phoneNumber && (
        <InfoRow
          icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          text={studio.phoneNumber}
          onPress={() => Linking.openURL(`tel:${studio.phoneNumber}`)}
        />
      )}

      {/* Website */}
      {studio.website && (
        <InfoRow
          icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          text={studio.website.replace(/^https?:\/\//, '')}
          onPress={() => Linking.openURL(studio.website!)}
        />
      )}

      {/* Opening hours */}
      {hours.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Card padding="md">
            {hours.map((line, i) => (
              <Text key={i} style={styles.hoursText}>{line}</Text>
            ))}
          </Card>
        </View>
      )}

      {/* Amenities */}
      {studio.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {studio.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

function InfoRow({ icon, text, onPress }: { icon: string; text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.infoRow} disabled={!onPress}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
        <Path d={icon} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={[styles.infoText, onPress && styles.infoTextLink]} numberOfLines={2}>{text}</Text>
    </Pressable>
  );
}

function ClaimForm({ studioId }: { studioId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('owner');
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and email.');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/studios/${studioId}/claim`, {
        method: 'POST',
        body: JSON.stringify({
          claimantName: name.trim(),
          claimantEmail: email.trim().toLowerCase(),
          claimantPhone: phone.trim() || undefined,
          businessRole: role,
          proofDescription: proof.trim() || undefined,
        }),
        skipAuth: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Claim Submitted', 'We will review your claim and get back to you.');
      setName(''); setEmail(''); setPhone(''); setProof('');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to submit claim. You may already have a pending claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = ['owner', 'manager', 'employee'];

  return (
    <View>
      <Text style={styles.formDescription}>If you own or manage this studio, you can claim it to update its information.</Text>
      <Text style={styles.fieldLabel}>Your Name *</Text>
      <TextInput style={styles.fieldInput} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.fg.muted} />
      <Text style={styles.fieldLabel}>Email *</Text>
      <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.fg.muted} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.fieldLabel}>Phone (optional)</Text>
      <TextInput style={styles.fieldInput} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.fg.muted} keyboardType="phone-pad" />
      <Text style={styles.fieldLabel}>Your Role</Text>
      <View style={styles.roleRow}>
        {roles.map((r) => (
          <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleChip, role === r && styles.roleChipActive]}>
            <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.fieldLabel}>Proof of Ownership (optional)</Text>
      <TextInput style={[styles.fieldInput, styles.textArea]} value={proof} onChangeText={setProof} placeholder="How can we verify you own/manage this studio?" placeholderTextColor={colors.fg.muted} multiline textAlignVertical="top" />
      <Button title={submitting ? 'Submitting...' : 'Submit Claim'} onPress={handleSubmit} disabled={submitting} />
    </View>
  );
}

function SuggestEditForm({ studioId }: { studioId: string }) {
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [reason, setReason] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const changes: Record<string, string> = {};
    if (editName.trim()) changes.name = editName.trim();
    if (editAddress.trim()) changes.address = editAddress.trim();
    if (editPhone.trim()) changes.phoneNumber = editPhone.trim();
    if (editWebsite.trim()) changes.website = editWebsite.trim();

    if (Object.keys(changes).length === 0) {
      Alert.alert('No Changes', 'Please fill in at least one field to suggest.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/api/studios/${studioId}/suggest-edit`, {
        method: 'POST',
        body: JSON.stringify({
          submitterEmail: submitterEmail.trim().toLowerCase() || undefined,
          suggestedChanges: changes,
          reason: reason.trim() || undefined,
        }),
        skipAuth: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Suggestion Submitted', 'Thank you! We will review your suggestion.');
      setEditName(''); setEditAddress(''); setEditPhone(''); setEditWebsite(''); setReason(''); setSubmitterEmail('');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.formDescription}>See something wrong? Suggest corrections and we'll review them.</Text>
      <Text style={styles.fieldLabel}>Your Email (optional)</Text>
      <TextInput style={styles.fieldInput} value={submitterEmail} onChangeText={setSubmitterEmail} placeholder="Email address" placeholderTextColor={colors.fg.muted} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.fieldLabel}>Studio Name</Text>
      <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholder="Corrected name" placeholderTextColor={colors.fg.muted} />
      <Text style={styles.fieldLabel}>Address</Text>
      <TextInput style={styles.fieldInput} value={editAddress} onChangeText={setEditAddress} placeholder="Corrected address" placeholderTextColor={colors.fg.muted} />
      <Text style={styles.fieldLabel}>Phone Number</Text>
      <TextInput style={styles.fieldInput} value={editPhone} onChangeText={setEditPhone} placeholder="Corrected phone" placeholderTextColor={colors.fg.muted} keyboardType="phone-pad" />
      <Text style={styles.fieldLabel}>Website</Text>
      <TextInput style={styles.fieldInput} value={editWebsite} onChangeText={setEditWebsite} placeholder="Corrected website URL" placeholderTextColor={colors.fg.muted} autoCapitalize="none" keyboardType="url" />
      <Text style={styles.fieldLabel}>Reason (optional)</Text>
      <TextInput style={[styles.fieldInput, styles.textArea]} value={reason} onChangeText={setReason} placeholder="Why is this change needed?" placeholderTextColor={colors.fg.muted} multiline textAlignVertical="top" />
      <Button title={submitting ? 'Submitting...' : 'Submit Suggestion'} onPress={handleSubmit} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.sizes.base, color: colors.fg.tertiary, marginBottom: spacing.md },
  link: { fontSize: typography.sizes.base, color: colors.fg.primary, textDecorationLine: 'underline' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border.default },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.fg.primary },
  tabText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, fontWeight: typography.weights.medium },
  tabTextActive: { color: colors.fg.primary },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  photoContainer: { marginBottom: spacing.md, borderRadius: radius.md, overflow: 'hidden' },
  photo: { width: '100%', height: PHOTO_HEIGHT, backgroundColor: colors.cream05 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  ratingText: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  ratingCount: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  verifiedBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  verifiedText: { fontSize: 11, color: 'rgba(34, 197, 94, 0.9)', fontWeight: typography.weights.medium },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  infoText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1, lineHeight: 20 },
  infoTextLink: { color: colors.fg.primary, textDecorationLine: 'underline' },
  section: { marginBottom: spacing.lg, marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  hoursText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.cream10 },
  amenityText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, textTransform: 'capitalize' },
  formDescription: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, lineHeight: 20, marginBottom: spacing.lg },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs, marginTop: spacing.sm },
  fieldInput: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.fg.primary, marginBottom: spacing.sm },
  textArea: { minHeight: 80 },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  roleChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.default },
  roleChipActive: { backgroundColor: colors.fg.primary, borderColor: colors.fg.primary },
  roleChipText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, textTransform: 'capitalize' },
  roleChipTextActive: { color: colors.bg.primary },
});
