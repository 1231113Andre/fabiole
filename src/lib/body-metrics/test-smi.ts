
import { calculateSMIFromLimbs } from './fitness';

const msRight = 7;
const msLeft = 7;
const miRight = 7;
const miLeft = 7;
const height = 180; // cm

const smi = calculateSMIFromLimbs(msRight, msLeft, miRight, miLeft, height);

console.log(`Inputs: MS_Right=${msRight}, MS_Left=${msLeft}, MI_Right=${miRight}, MI_Left=${miLeft}, Height=${height}cm`);
console.log(`Calculated SMI: ${smi}`);

if (smi === 8.64) {
    console.log("SUCCESS: Result matches expected value 8.64");
} else {
    console.log(`FAILURE: Expected 8.64 but got ${smi}`);
}
