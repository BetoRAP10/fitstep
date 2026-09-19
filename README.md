# FitStep

App de actividad física hecha con Expo + React Native + TypeScript. Cuenta pasos en tiempo real, detecta si estás quieto, caminando o corriendo, calcula calorías con dos métodos distintos, y compara tu progreso contra el resto en un ranking.

Corre completa en **Expo Go** — sin development build, sin código nativo propio.

## Cómo correrla

```bash
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** (Android/iOS) desde tu teléfono, en la misma red Wi-Fi que tu computadora.

### Probar con gente fuera de tu red (equipo remoto)

```bash
npx expo start --tunnel
```

Expone tu servidor a internet vía un túnel. Dos cosas a tener en cuenta:

- Necesitas una cuenta de Expo (gratis, en [expo.dev](https://expo.dev)). Inicia sesión con `npx expo login` **antes** de correr el túnel.
- La persona que abre el link también debe iniciar sesión en la app Expo Go **con esa misma cuenta** (pestaña Perfil → Iniciar sesión). Expo exige que ambos lados coincidan; si no, muestra un error de cuentas no coincidentes.
- El túnel depende de que tu computadora y el comando sigan corriendo. Si lo cierras, el link deja de funcionar.

## Variables de entorno

Copia `.env.example` a `.env` y llena las credenciales de tu proyecto de Supabase:

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
```

Usa siempre la **clave publicable/anon**, nunca la `service_role` ni la `secret` — esas no deben estar en una app cliente porque quedan visibles en el bundle.

Si no defines estas variables, la app arranca en **modo local**: cuentas y ranking simulados con AsyncStorage, sin backend. Es la misma app, solo cambia de dónde vienen los datos (`services/auth.ts` y `services/ranking.ts` deciden automáticamente).

## Conectar tu propio Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **Authentication → Providers → Email**, si quieres poder iniciar sesión inmediatamente después de registrarte (sin revisar el correo), desactiva **"Confirm email"**. Ten en cuenta que el servicio de correo compartido de Supabase tiene un límite muy bajo (2 correos/hora) si no configuras tu propio SMTP — con "Confirm email" desactivado no depende de eso.
3. Corre las migraciones incluidas en `supabase/migrations/` contra tu proyecto:
   ```bash
   npx supabase login
   npx supabase link --project-ref TU_REFERENCIA
   npx supabase db push
   ```
   Esto crea:
   - **`profiles`**: datos privados del usuario (nombre, sexo, edad, estatura, peso, meta diaria), con RLS para que cada quien solo vea y edite el suyo.
   - **`daily_stats`**: pasos/segundos/calorías por día y por usuario.
   - **`ranking_public`**: vista que expone solo nombre, calorías, actividad y fecha — nunca peso, estatura, edad, sexo ni correo.
4. Copia la URL y la clave publicable del proyecto (Project Settings → API) a tu `.env`.

Si prefieres no correr el CLI, el SQL completo está en los archivos de `supabase/migrations/` y se puede pegar directo en el SQL Editor del dashboard.

## Ajustar la detección de actividad

Toda la lógica de quieto/caminando/corriendo vive en `hooks/useActivity.ts`, pero los números que la gobiernan están centralizados en **`constants/activity.ts`** para poder ajustarlos sin tocar código:

| Constante | Qué hace |
|---|---|
| `stillCadenceBelow` | Por debajo de esta cadencia (pasos/min) se considera quieto. |
| `stillNoStepsSeconds` | Si no llega ningún paso en este tiempo, pasa a quieto sin importar la cadencia anterior. |
| `walkingCadenceMin` / `walkingCadenceMax` | Rango de cadencia que cuenta como caminar. |
| `runningCadenceAbove` | Por encima de esta cadencia, siempre es correr. |
| `runningHighIntensityCadenceAbove` | Cadencia menor a la anterior que igual cuenta como correr **si** además hay intensidad alta en el acelerómetro. |
| `cadenceSmoothingSeconds` | Ventana de tiempo usada para promediar la cadencia (evita parpadeo por los lotes de pasos de iOS). |
| `accelerometerWindowSeconds` / `accelerometerIntervalMs` | Ventana y frecuencia de muestreo del acelerómetro para calcular intensidad (RMS). |
| `highIntensityRmsThreshold` | Umbral de RMS a partir del cual se considera "intensidad alta". Es el valor más dependiente del dispositivo — si en tu teléfono correr no se detecta bien, prueba subirlo o bajarlo. |
| `hysteresisSeconds` | Tiempo que un nuevo estado debe sostenerse antes de confirmarse, para no parpadear entre estados en cadencias frontera. |

## Cómo se calculan las calorías

`utils/calories.ts` implementa dos métodos en paralelo (ver `utils/__tests__/calories.test.ts` para el caso de referencia):

- **MET** (oficial, el que se muestra en Hoy y se sube al ranking): `MET(actividad, cadencia) × peso(kg) × horas`, acumulado segundo a segundo mientras hay actividad. La tabla de MET por cadencia está en `constants/met.ts`.
- **Pasos-zancada** (comparativo): `pasos × zancada(m) × peso(kg) × coeficiente`. Coeficientes y factores de zancada están en `constants/calories.ts`.

## Limitaciones conocidas

- **En Expo Go, el conteo de pasos se detiene si cierras la app por completo** (no solo minimizarla). Es una limitación de Expo Go, no de la app — en una build nativa con `expo-task-manager` se podría contar en segundo plano.
- El **acelerómetro consume batería** más rápido de lo normal mientras la app está abierta y detectando actividad.
- El modo túnel (`--tunnel`) es más lento que la red local porque todo el tráfico pasa por los servidores de Expo/ngrok.
- En el ranking respaldado por Supabase, la flecha de "subiste/bajaste respecto a ayer" queda neutra (no calculamos un snapshot histórico de posiciones); en el modo local simulado sí se ve el movimiento.
- El bloqueo con Face ID/huella se reinicia en cada arranque en frío de la app (cerrarla del todo y volver a abrirla), no al simplemente pasarla a segundo plano.
- Los cambios de perfil (nombre, peso, estatura, meta) después del registro se guardan localmente pero no se vuelven a sincronizar con la tabla `profiles` de Supabase todavía.

## Pruebas

```bash
npm test
```

Corre las pruebas unitarias de `utils/calories.ts` (ambos métodos, interpolación de la tabla MET, y el caso de referencia del proyecto: 70 kg, 10,000 pasos, zancada 0.75 m, 100 spm → 262.5 kcal / 408.33 kcal).
