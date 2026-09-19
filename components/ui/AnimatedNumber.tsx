import { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  style?: StyleProp<TextStyle>;
}

// Cuenta desde el valor anterior hasta el nuevo con easing de salida, en vez
// de saltar directo — usado para los números protagonistas de Hoy.
export function AnimatedNumber({ value, duration = 500, formatter, style }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = Date.now();

    const step = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const text = formatter ? formatter(display) : display.toLocaleString('es-MX');
  return <Text style={style}>{text}</Text>;
}
