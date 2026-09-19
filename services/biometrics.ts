import * as LocalAuthentication from 'expo-local-authentication';

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
  if (!hasHardware) return false;
  return LocalAuthentication.isEnrolledAsync().catch(() => false);
}

// disableDeviceFallback: false deja que iOS/Android ofrezcan el código del
// dispositivo automáticamente si Face ID / huella falla o no está disponible.
export async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });
  return result.success;
}
