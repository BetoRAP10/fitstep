import { strideCalories, metForCadence, metCalories } from '../calories';

describe('calorias', () => {
  // Caso de referencia del proyecto: 70 kg, 10,000 pasos, zancada 0.75 m, 100 spm.
  const weightKg = 70;
  const steps = 10000;
  const strideMeters = 0.75;
  const cadence = 100;

  it('método pasos-zancada da 262.5 kcal', () => {
    expect(strideCalories(steps, strideMeters, weightKg, 'walking')).toBeCloseTo(262.5, 2);
  });

  it('método MET da 408.33 kcal (100 min = 1.667 h a 3.5 MET)', () => {
    const hours = steps / cadence / 60;
    const met = metForCadence('walking', cadence);
    expect(met).toBe(3.5);
    expect(metCalories(met, weightKg, hours)).toBeCloseTo(408.33, 2);
  });

  it('MET interpola entre puntos de la tabla de caminata', () => {
    // Punto medio entre 100 spm (3.5) y 120 spm (4.3) => 90 debería dar 3.15.
    expect(metForCadence('walking', 90)).toBeCloseTo(3.15, 5);
  });

  it('MET interpola entre puntos de la tabla de carrera', () => {
    // Punto medio entre 150 spm (8.3) y 160 spm (9.8) => 155 debería dar 9.05.
    expect(metForCadence('running', 155)).toBeCloseTo(9.05, 5);
  });

  it('MET se fija en los extremos de la tabla en vez de extrapolar', () => {
    expect(metForCadence('walking', 40)).toBe(2.8);
    expect(metForCadence('walking', 200)).toBe(5.0);
    expect(metForCadence('running', 100)).toBe(8.3);
    expect(metForCadence('running', 250)).toBe(11.8);
  });

  it('quieto siempre es 1.0 MET sin importar la cadencia', () => {
    expect(metForCadence('still', 0)).toBe(1.0);
  });

  it('correr usa el coeficiente y la zancada distintos de caminar', () => {
    const walking = strideCalories(steps, strideMeters, weightKg, 'walking');
    const running = strideCalories(steps, strideMeters, weightKg, 'running');
    expect(running).toBeCloseTo(walking * 2, 5);
  });
});
