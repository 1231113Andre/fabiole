/**
 * Body Metrics Calculations - Test Examples
 * 
 * This file contains practical examples to verify all calculations are working correctly.
 * Run this file to see example outputs for various body metrics.
 */

import { calculateBMI, classifyBMI } from './bmi';
import { calculateMM, calculateH2O, calculateH2OFull, classifyBodyFat } from './composition';
import { calculateSMI, classifySMI, calculateVO2MaxRockport, classifyMileResult, classifySitUps, classifyPushUps } from './fitness';

console.log('='.repeat(80));
console.log('BODY METRICS CALCULATIONS - TEST EXAMPLES');
console.log('='.repeat(80));

// Example 1: Male Athlete
console.log('\n📊 Example 1: Male Athlete (25 years, 80 kg, 180 cm, 10% body fat)');
console.log('-'.repeat(80));

const athlete = {
    weight: 80,
    height: 180,
    age: 25,
    gender: 'Masculino' as const,
    bodyFat: 10
};

const athleteBMI = calculateBMI(athlete.weight, athlete.height);
const athleteLBM = calculateMM(athlete.weight, athlete.bodyFat);
const athleteTBW = calculateH2OFull(athlete.weight, athlete.height, athlete.age, athlete.gender);
const athleteSMI = calculateSMI(athleteLBM!, athlete.height);

console.log(`BMI: ${athleteBMI?.toFixed(1)} kg/m² - ${classifyBMI(athleteBMI)}`);
console.log(`Body Fat: ${athlete.bodyFat}% - ${classifyBodyFat(athlete.bodyFat, athlete.gender, athlete.age)}`);
console.log(`Lean Body Mass: ${athleteLBM?.toFixed(2)} kg`);
console.log(`Total Body Water: ${athleteTBW.percent?.toFixed(1)}% (${athleteTBW.kg?.toFixed(1)} kg)`);
console.log(`SMI: ${athleteSMI?.toFixed(2)} kg/m² - ${classifySMI(athleteSMI, athlete.gender)}`);

// Example 2: Female Fitness Enthusiast
console.log('\n📊 Example 2: Female Fitness Enthusiast (30 years, 60 kg, 165 cm, 22% body fat)');
console.log('-'.repeat(80));

const female = {
    weight: 60,
    height: 165,
    age: 30,
    gender: 'Feminino' as const,
    bodyFat: 22
};

const femaleBMI = calculateBMI(female.weight, female.height);
const femaleLBM = calculateMM(female.weight, female.bodyFat);
const femaleTBW = calculateH2OFull(female.weight, female.height, female.age, female.gender);
const femaleSMI = calculateSMI(femaleLBM!, female.height);

console.log(`BMI: ${femaleBMI?.toFixed(1)} kg/m² - ${classifyBMI(femaleBMI)}`);
console.log(`Body Fat: ${female.bodyFat}% - ${classifyBodyFat(female.bodyFat, female.gender, female.age)}`);
console.log(`Lean Body Mass: ${femaleLBM?.toFixed(2)} kg`);
console.log(`Total Body Water: ${femaleTBW.percent?.toFixed(1)}% (${femaleTBW.kg?.toFixed(1)} kg)`);
console.log(`SMI: ${femaleSMI?.toFixed(2)} kg/m² - ${classifySMI(femaleSMI, female.gender)}`);

// Example 3: Person with Obesity
console.log('\n📊 Example 3: Person with Obesity (40 years, 120 kg, 175 cm, 35% body fat)');
console.log('-'.repeat(80));

const obese = {
    weight: 120,
    height: 175,
    age: 40,
    gender: 'Masculino' as const,
    bodyFat: 35
};

const obeseBMI = calculateBMI(obese.weight, obese.height);
const obeseLBM = calculateMM(obese.weight, obese.bodyFat);
const obeseTBW = calculateH2OFull(obese.weight, obese.height, obese.age, obese.gender);
const obeseSMI = calculateSMI(obeseLBM!, obese.height);

console.log(`BMI: ${obeseBMI?.toFixed(1)} kg/m² - ${classifyBMI(obeseBMI)}`);
console.log(`Body Fat: ${obese.bodyFat}% - ${classifyBodyFat(obese.bodyFat, obese.gender, obese.age)}`);
console.log(`Lean Body Mass: ${obeseLBM?.toFixed(2)} kg`);
console.log(`Total Body Water: ${obeseTBW.percent?.toFixed(1)}% (${obeseTBW.kg?.toFixed(1)} kg)`);
console.log(`SMI: ${obeseSMI?.toFixed(2)} kg/m² - ${classifySMI(obeseSMI, obese.gender)}`);

// Example 4: Older Adult
console.log('\n📊 Example 4: Older Adult (65 years, 70 kg, 170 cm, 28% body fat)');
console.log('-'.repeat(80));

const older = {
    weight: 70,
    height: 170,
    age: 65,
    gender: 'Masculino' as const,
    bodyFat: 28
};

const olderBMI = calculateBMI(older.weight, older.height);
const olderLBM = calculateMM(older.weight, older.bodyFat);
const olderTBW = calculateH2OFull(older.weight, older.height, older.age, older.gender);
const olderSMI = calculateSMI(olderLBM!, older.height);

console.log(`BMI: ${olderBMI?.toFixed(1)} kg/m² - ${classifyBMI(olderBMI)}`);
console.log(`Body Fat: ${older.bodyFat}% - ${classifyBodyFat(older.bodyFat, older.gender, older.age)}`);
console.log(`Lean Body Mass: ${olderLBM?.toFixed(2)} kg`);
console.log(`Total Body Water: ${olderTBW.percent?.toFixed(1)}% (${olderTBW.kg?.toFixed(1)} kg)`);
console.log(`SMI: ${olderSMI?.toFixed(2)} kg/m² - ${classifySMI(olderSMI, older.gender)}`);

// Example 5: VO2 Max Calculation
console.log('\n📊 Example 5: VO2 Max (Rockport Walking Test)');
console.log('-'.repeat(80));

const vo2Test1 = {
    time: '10:00',
    heartRate: 140,
    weight: 80,
    age: 30,
    gender: 'Masculino' as const
};

const vo2Max1 = calculateVO2MaxRockport(
    vo2Test1.time,
    vo2Test1.heartRate,
    vo2Test1.weight,
    vo2Test1.age,
    vo2Test1.gender
);

console.log(`Male (30 years, 80 kg): 1-mile time ${vo2Test1.time}, HR ${vo2Test1.heartRate} bpm`);
console.log(`VO2 Max: ${vo2Max1?.toFixed(1)} ml/kg/min`);

const vo2Test2 = {
    time: '12:00',
    heartRate: 150,
    weight: 60,
    age: 30,
    gender: 'Feminino' as const
};

const vo2Max2 = calculateVO2MaxRockport(
    vo2Test2.time,
    vo2Test2.heartRate,
    vo2Test2.weight,
    vo2Test2.age,
    vo2Test2.gender
);

console.log(`Female (30 years, 60 kg): 1-mile time ${vo2Test2.time}, HR ${vo2Test2.heartRate} bpm`);
console.log(`VO2 Max: ${vo2Max2?.toFixed(1)} ml/kg/min`);

// Example 6: Fitness Tests
console.log('\n📊 Example 6: Fitness Tests Classifications');
console.log('-'.repeat(80));

const mileResult = classifyMileResult('08:30', 35, 'Masculino');
console.log(`1-Mile Walk Test (Male, 35 years, 08:30): ${mileResult}`);

const pushUpsResult = classifyPushUps(40, 35, 'Masculino');
console.log(`Push-ups Test (Male, 35 years, 40 reps): ${pushUpsResult}`);

const sitUpsResult = classifySitUps(35, 35, 'Masculino');
console.log(`Sit-ups Test (Male, 35 years, 35 reps): ${sitUpsResult}`);

// Example 7: Edge Cases
console.log('\n📊 Example 7: Edge Cases and Boundary Values');
console.log('-'.repeat(80));

console.log('\nBMI Boundaries:');
console.log(`BMI 18.5: ${classifyBMI(18.5)}`);
console.log(`BMI 24.9: ${classifyBMI(24.9)}`);
console.log(`BMI 25.0: ${classifyBMI(25.0)}`);
console.log(`BMI 29.9: ${classifyBMI(29.9)}`);
console.log(`BMI 30.0: ${classifyBMI(30.0)}`);

console.log('\nBody Fat Boundaries (Male, 25 years):');
console.log(`5% BF: ${classifyBodyFat(5, 'M', 25)}`);
console.log(`13% BF: ${classifyBodyFat(13, 'M', 25)}`);
console.log(`17% BF: ${classifyBodyFat(17, 'M', 25)}`);
console.log(`24% BF: ${classifyBodyFat(24, 'M', 25)}`);
console.log(`28% BF: ${classifyBodyFat(28, 'M', 25)}`);

console.log('\nSMI Boundaries (Male):');
console.log(`SMI 12.0: ${classifySMI(12.0, 'M')}`);
console.log(`SMI 10.5: ${classifySMI(10.5, 'M')}`);
console.log(`SMI 9.0: ${classifySMI(9.0, 'M')}`);
console.log(`SMI 7.5: ${classifySMI(7.5, 'M')}`);
console.log(`SMI 6.5: ${classifySMI(6.5, 'M')}`);

// Example 8: Validation Tests
console.log('\n📊 Example 8: Input Validation');
console.log('-'.repeat(80));

console.log('\nNull/Invalid Inputs:');
console.log(`BMI(null, 180): ${calculateBMI(null, 180)}`);
console.log(`BMI(80, null): ${calculateBMI(80, null)}`);
console.log(`BMI(0, 180): ${calculateBMI(0, 180)}`);
console.log(`LBM(null, 15): ${calculateMM(null, 15)}`);
console.log(`LBM(80, -5): ${calculateMM(80, -5)}`);
console.log(`LBM(80, 105): ${calculateMM(80, 105)}`);

console.log('\n' + '='.repeat(80));
console.log('✅ All test examples completed successfully!');
console.log('='.repeat(80));

// Export for potential use in other files
export const testExamples = {
    athlete,
    female,
    obese,
    older,
    vo2Test1,
    vo2Test2
};
