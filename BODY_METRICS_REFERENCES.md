# Body Metrics Calculations - Scientific References

This document provides comprehensive scientific references and explanations for all body composition and fitness metrics calculations used in this application.

## Table of Contents

1. [BMI (Body Mass Index)](#bmi-body-mass-index)
2. [Body Fat Percentage](#body-fat-percentage)
3. [Lean Body Mass (LBM)](#lean-body-mass-lbm)
4. [Total Body Water (TBW)](#total-body-water-tbw)
5. [Skeletal Muscle Index (SMI)](#skeletal-muscle-index-smi)
6. [VO2 Max (Rockport Walking Test)](#vo2-max-rockport-walking-test)
7. [Fitness Tests](#fitness-tests)

---

## BMI (Body Mass Index)

### Formula
```
BMI = weight (kg) / height (m)²
```

### Classification (WHO Standards)
| BMI Range | Classification |
|-----------|----------------|
| < 18.5 | Underweight (Baixo Peso) |
| 18.5-24.9 | Normal weight (Peso Normal) |
| 25.0-29.9 | Pre-obesity (Pré-obesidade) |
| 30.0-34.9 | Obesity class I (Obesidade Grau I) |
| 35.0-39.9 | Obesity class II (Obesidade Grau II) |
| ≥ 40.0 | Obesity class III (Obesidade Grau III) |

### Scientific References
- **Keys, A., et al. (1972).** "Indices of relative weight and obesity". *Journal of Chronic Diseases*, 25(6-7), 329-343.
- **WHO (2000).** "Obesity: preventing and managing the global epidemic". *WHO Technical Report Series 894*.
- **Garrow, J.S., & Webster, J. (1985).** "Quetelet's index (W/H²) as a measure of fatness". *International Journal of Obesity*, 9(2), 147-153.

### Notes
- BMI is a screening tool and does not directly measure body fat
- May not be accurate for athletes, elderly, or certain ethnic groups
- Should be used in conjunction with other health indicators

---

## Body Fat Percentage

### Classification by Age and Gender

#### Males
| Age | Essential | Athlete | Fitness | Average | Risk |
|-----|-----------|---------|---------|---------|------|
| 18-29 | < 6% | 6-13% | 14-17% | 18-24% | > 24% |
| 30-39 | < 11% | 11-15% | 16-19% | 20-25% | > 25% |
| 40-49 | < 13% | 13-17% | 18-21% | 22-26% | > 26% |
| 50-59 | < 14% | 14-19% | 20-23% | 24-27% | > 27% |
| 60+ | < 15% | 15-20% | 21-24% | 25-28% | > 28% |

#### Females
| Age | Essential | Athlete | Fitness | Average | Risk |
|-----|-----------|---------|---------|---------|------|
| 18-29 | < 14% | 14-20% | 21-24% | 25-31% | > 31% |
| 30-39 | < 15% | 15-21% | 22-25% | 26-32% | > 32% |
| 40-49 | < 16% | 16-23% | 24-27% | 28-33% | > 33% |
| 50-59 | < 17% | 17-25% | 26-29% | 30-35% | > 35% |
| 60+ | < 18% | 18-26% | 27-30% | 31-36% | > 36% |

### Essential Fat Requirements
- **Males:** 2-5% (for basic physiological functions)
- **Females:** 10-13% (includes sex-specific fat for reproductive functions)

### Scientific References
- **American Council on Exercise (ACE) (2009).** "ACE Body Fat Percentage Norms for Men and Women".
- **Gallagher, D., et al. (2000).** "Healthy percentage body fat ranges: an approach for developing guidelines based on body mass index". *American Journal of Clinical Nutrition*, 72(3), 694-701.
- **Jackson, A.S., & Pollock, M.L. (1985).** "Practical Assessment of Body Composition". *The Physician and Sportsmedicine*, 13(5), 76-90.
- **Lohman, T.G. (1992).** "Advances in Body Composition Assessment". *Human Kinetics Publishers*.

### Notes
- Body fat percentage varies by age due to natural physiological changes
- Women require higher essential fat for reproductive functions
- Athletes typically have lower body fat percentages

---

## Lean Body Mass (LBM)

### Formula
```
LBM = Body Weight (kg) × (1 - Body Fat % / 100)
```

### Components
LBM includes:
- Skeletal muscle
- Bones
- Organs
- Blood
- Skin
- Connective tissue

**Note:** Everything except fat mass

### Scientific References
- **Heymsfield, S.B., et al. (2005).** "Human Body Composition". *Human Kinetics*.
- **Wang, Z., et al. (1992).** "The five-level model: a new approach to organizing body-composition research". *American Journal of Clinical Nutrition*, 56(1), 19-28.
- **Forbes, G.B. (1987).** "Human Body Composition: Growth, Aging, Nutrition, and Activity". *Springer-Verlag*.

### Notes
- LBM is also called Fat-Free Mass (FFM)
- Bones are part of LBM and should NOT be subtracted separately
- Higher LBM is associated with better metabolic health

---

## Total Body Water (TBW)

### Watson Formula

#### Males
```
TBW (L) = 2.447 - (0.09156 × age) + (0.1074 × height_cm) + (0.3362 × weight_kg)
```

#### Females
```
TBW (L) = -2.097 + (0.1069 × height_cm) + (0.2466 × weight_kg)
```

### Normal Ranges
- **Adult males:** 50-65% of body weight
- **Adult females:** 45-60% of body weight
- Decreases with age and increases with lean body mass

### Scientific References
- **Watson, P.E., et al. (1980).** "Total body water volumes for adult males and females estimated from simple anthropometric measurements". *American Journal of Clinical Nutrition*, 33(1), 27-39.
- **Roubenoff, R., et al. (1993).** "Application of bioelectrical impedance analysis to elderly populations". *Journal of Gerontology*, 48(3), M129-M135.
- **Chumlea, W.C., et al. (2001).** "Total body water reference values and prediction equations for adults". *Kidney International*, 59(6), 2250-2258.

### Notes
- TBW in liters is approximately equal to TBW in kg (density ≈ 1 kg/L)
- Watson formula is one of the most accurate methods for estimating TBW
- Used clinically for drug dosing and fluid management

---

## Skeletal Muscle Index (SMI)

### Formula
```
SMI = Skeletal Muscle Mass (kg) / Height (m)²
```

### Classification

#### Males
| Classification | SMI Range (kg/m²) |
|----------------|-------------------|
| Excelente (Atleta) | > 11.0 |
| Bom (Saudável) | 10.0-11.0 |
| Médio (Normal) | 8.5-9.99 |
| Baixo (Risco) | 7.0-8.49 |
| Crítico (Sarcopenia) | < 7.0 |

#### Females
| Classification | SMI Range (kg/m²) |
|----------------|-------------------|
| Excelente (Atleta) | > 8.5 |
| Bom (Saudável) | 7.5-8.5 |
| Médio (Normal) | 6.75-7.49 |
| Baixo (Risco) | 5.4-6.74 |
| Crítico (Sarcopenia) | < 5.4 |

### Clinical Significance
- **SMI < 8.50 kg/m² (men)** or **< 6.75 kg/m² (women)**: Class II sarcopenia
- **SMI < 7.0 kg/m² (men)** or **< 5.4 kg/m² (women)**: Severe sarcopenia
- Low SMI associated with increased risk of physical disability, falls, and mortality

### Scientific References
- **Janssen, I., et al. (2002).** "Skeletal muscle cutpoints associated with elevated physical disability risk in older men and women". *American Journal of Epidemiology*, 156(2), 110-121.
- **Baumgartner, R.N., et al. (1998).** "Epidemiology of sarcopenia among the elderly in New Mexico". *American Journal of Epidemiology*, 147(8), 755-763.
- **Cruz-Jentoft, A.J., et al. (2019).** "Sarcopenia: revised European consensus on definition and diagnosis". *Age and Ageing*, 48(1), 16-31.
- **Kim, J., et al. (2012).** "Total-body skeletal muscle mass: estimation by a new dual-energy X-ray absorptiometry method". *American Journal of Clinical Nutrition*, 76(2), 378-383.

### Notes
- SMI is analogous to BMI but uses muscle mass instead of total body weight
- Used to diagnose and monitor sarcopenia (age-related muscle loss)
- Important for assessing frailty and physical function in older adults

---

## VO2 Max (Rockport Walking Test)

### Formula (Kline et al., 1987)
```
VO2max = 132.853 - (0.0769 × weight_lbs) - (0.3877 × age) + (6.315 × gender) 
         - (3.2649 × time_min) - (0.1565 × heart_rate)
```

Where:
- **weight_lbs:** Body weight in pounds
- **age:** Age in years
- **gender:** 1 for male, 0 for female
- **time_min:** Time to complete 1 mile walk in minutes (decimal)
- **heart_rate:** Heart rate immediately after walk (bpm)

### Test Protocol
1. Walk 1 mile (1.6 km) as fast as possible on a flat surface
2. Record time to complete the mile
3. Measure heart rate immediately upon completion

### VO2 Max Interpretation (ml/kg/min)

#### Males
| Age | Excellent | Good | Average | Below Average |
|-----|-----------|------|---------|---------------|
| 20-29 | > 50 | 43-50 | 35-42 | < 35 |
| 30-39 | > 48 | 41-48 | 33-40 | < 33 |
| 40-49 | > 46 | 38-45 | 31-37 | < 31 |
| 50-59 | > 43 | 36-42 | 28-35 | < 28 |
| 60+ | > 40 | 33-39 | 26-32 | < 26 |

#### Females
| Age | Excellent | Good | Average | Below Average |
|-----|-----------|------|---------|---------------|
| 20-29 | > 45 | 36-45 | 28-35 | < 28 |
| 30-39 | > 43 | 34-42 | 26-33 | < 26 |
| 40-49 | > 40 | 32-39 | 24-31 | < 24 |
| 50-59 | > 37 | 29-36 | 22-28 | < 22 |
| 60+ | > 35 | 27-34 | 20-26 | < 20 |

### Scientific References
- **Kline, G.M., et al. (1987).** "Estimation of VO2max from a one-mile track walk, gender, age, and body weight". *Medicine and Science in Sports and Exercise*, 19(3), 253-259.
- **ACSM (2018).** "ACSM's Guidelines for Exercise Testing and Prescription" (10th ed.). *Wolters Kluwer*.
- **Rockport Walking Institute.** Normative data for the Rockport Walking Test.

### Notes
- VO2 max is the gold standard measure of cardiorespiratory fitness
- The Rockport test is a submaximal test suitable for most populations
- More practical than maximal exercise testing for general fitness assessment

---

## Fitness Tests

### 1-Mile Walk Test (Teste da Milha)

#### Reference Times (mm:ss)

**Males:**
| Age | Excelente | Bom | Médio | Fraco |
|-----|-----------|-----|-------|-------|
| 20-29 | < 07:30 | 07:31-08:30 | 08:31-09:45 | > 10:30 |
| 30-39 | < 08:00 | 08:01-09:00 | 09:01-10:20 | > 11:30 |
| 40-49 | < 08:30 | 08:31-09:30 | 09:31-10:50 | > 12:00 |
| 50-59 | < 09:30 | 09:31-10:30 | 10:31-12:10 | > 13:45 |
| 60-69 | < 10:30 | 10:31-11:30 | 11:31-13:30 | > 15:00 |

**Females:**
| Age | Excelente | Bom | Médio | Fraco |
|-----|-----------|-----|-------|-------|
| 20-29 | < 09:00 | 09:01-10:30 | 10:31-12:00 | > 13:30 |
| 30-39 | < 09:45 | 09:46-11:00 | 11:01-12:45 | > 14:15 |
| 40-49 | < 10:30 | 10:31-11:45 | 11:46-13:30 | > 15:00 |
| 50-59 | < 11:30 | 11:31-12:45 | 12:46-15:00 | > 16:30 |
| 60-69 | < 12:30 | 12:31-14:00 | 14:01-16:30 | > 18:00 |

### Push-ups Test (1 minute)

**Males:**
| Age | Excelente | Bom | Médio | Mau |
|-----|-----------|-----|-------|-----|
| 20-29 | 50+ | 36-49 | 20-35 | 0-19 |
| 30-39 | 45+ | 30-44 | 17-29 | 0-16 |
| 40-49 | 40+ | 26-39 | 14-25 | 0-13 |
| 50-59 | 35+ | 21-34 | 11-20 | 0-10 |
| 60+ | 30+ | 17-29 | 8-16 | 0-7 |

**Females:**
| Age | Excelente | Bom | Médio | Mau |
|-----|-----------|-----|-------|-----|
| 20-29 | 35+ | 25-34 | 13-24 | 0-12 |
| 30-39 | 30+ | 21-29 | 11-20 | 0-10 |
| 40-49 | 25+ | 18-24 | 9-17 | 0-8 |
| 50-59 | 21+ | 15-20 | 7-14 | 0-6 |
| 60+ | 19+ | 12-18 | 5-11 | 0-4 |

### Sit-ups Test (1 minute)

**Males:**
| Age | Excelente | Bom | Médio | Abaixo da Média |
|-----|-----------|-----|-------|-----------------|
| 20-29 | 44+ | 39-43 | 35-38 | < 35 |
| 30-39 | 40+ | 35-39 | 30-34 | < 30 |
| 40-49 | 35+ | 27-34 | 23-26 | < 23 |
| 50-59 | 28+ | 21-27 | 15-20 | < 15 |
| 60+ | 24+ | 18-23 | 12-17 | < 12 |

**Females:**
| Age | Excelente | Bom | Médio | Abaixo da Média |
|-----|-----------|-----|-------|-----------------|
| 20-29 | 39+ | 33-38 | 29-32 | < 29 |
| 30-39 | 32+ | 25-31 | 20-24 | < 20 |
| 40-49 | 27+ | 19-26 | 15-18 | < 15 |
| 50-59 | 20+ | 12-19 | 8-11 | < 8 |
| 60+ | 14+ | 7-13 | 4-6 | < 4 |

### Scientific References for Fitness Tests
- **ACSM (2018).** "ACSM's Guidelines for Exercise Testing and Prescription" (10th ed.). *Wolters Kluwer*.
- **Canadian Society for Exercise Physiology (CSEP).** Normative data for fitness testing.
- **Pollock, M.L., et al. (1998).** "Resistance exercise in individuals with and without cardiovascular disease". *ACSM's Health & Fitness Journal*.
- **Golding, L.A., et al. (1989).** "Y's Way to Physical Fitness" (3rd ed.). *Human Kinetics*.

---

## Implementation Notes

### Data Validation
All calculations include input validation to ensure:
- Positive values for weight, height, and age
- Reasonable ranges for body fat percentage (0-100%)
- Proper format for time strings (mm:ss)

### Rounding and Precision
- BMI: 1 decimal place
- Body Fat %: 1 decimal place
- LBM: 2 decimal places
- TBW: 1 decimal place (%, kg)
- SMI: 2 decimal places
- VO2 Max: 1 decimal place

### Gender Handling
The system accepts multiple gender formats:
- Male: 'M', 'Masculino', 'MALE'
- Female: 'F', 'Feminino', 'FEMALE'

### Age Bands
Most classifications use standard age bands:
- 18-29 years
- 30-39 years
- 40-49 years
- 50-59 years
- 60+ years

---

## Disclaimer

These calculations and reference values are based on scientific literature and are intended for general fitness and health assessment purposes. They should not replace professional medical advice, diagnosis, or treatment. Individual results may vary based on factors such as:

- Ethnicity and genetic factors
- Training status and athletic background
- Medical conditions and medications
- Measurement accuracy and methodology
- Hydration status and recent food intake

Always consult with qualified healthcare professionals for personalized health and fitness recommendations.

---

## Last Updated
February 5, 2026

## Version
1.0.0
