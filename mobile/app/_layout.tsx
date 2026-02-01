import { View, Text, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pilareta Tribe</Text>
      <Text style={styles.sub}>App loaded successfully</Text>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202219',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#f6eddd',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sub: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
});
