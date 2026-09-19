import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { colors, spacing, fontFamily, fontSize } from '@/theme';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'activity',
  ranking: 'bar-chart-2',
  perfil: 'user',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const isFocused = state.index === index;
        const iconName = ICONS[route.name] ?? 'circle';

        const handlePress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            Haptics.selectionAsync();
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={handlePress} style={styles.tab} hitSlop={8}>
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Feather
                name={iconName}
                size={20}
                color={isFocused ? colors.textOnAccent : colors.textSecondary}
              />
            </View>
            <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textPrimary,
  },
});
