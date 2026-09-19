import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontFamily, fontSize } from '@/theme';

export default function RankingScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>Compárate con el resto por calorías quemadas.</Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>El podio y la tabla en vivo llegan en la fase 5</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  placeholder: {
    flex: 1,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderTitle: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
});
