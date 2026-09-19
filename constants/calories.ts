// Coeficientes del método pasos-zancada. Correr cuesta ~1 kcal/kg/km, de ahí
// que su coeficiente sea el doble del de caminar.
export const STRIDE_COEFFICIENT_WALKING = 0.0005;
export const STRIDE_COEFFICIENT_RUNNING = 0.001;

// Factor de zancada = estatura(m) × factor. Al correr la zancada se alarga
// notablemente, por eso su factor es independiente del sexo.
export const STRIDE_FACTOR_WALKING_MALE = 0.415;
export const STRIDE_FACTOR_WALKING_FEMALE = 0.413;
export const STRIDE_FACTOR_WALKING_UNSPECIFIED = 0.414;
export const STRIDE_FACTOR_RUNNING = 0.6;

// MET en reposo (no cuenta como actividad, solo referencia).
export const MET_STILL = 1.0;
