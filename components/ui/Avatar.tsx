import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from '@/theme';
import { colorForId } from '@/constants/avatarColors';

interface AvatarProps {
  id: string;
  name: string;
  size?: number;
  ringed?: boolean;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ id, name, size = 44, ringed = false }: AvatarProps) {
  const backgroundColor = colorForId(id);
  const ringSize = size + 6;

  const circle = (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initialsFor(name)}</Text>
    </View>
  );

  if (!ringed) return circle;

  return (
    <View
      style={[
        styles.ring,
        { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderColor: colors.accent },
      ]}
    >
      {circle}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.textSemiBold,
    color: colors.textOnAccent,
  },
});
