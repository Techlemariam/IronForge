/**
 * Calculates the Wilks Score (Points) for a lifter.
 * 
 * Formula (P = Lifted Weight):
 * Wilks = P * 500 / (a + bx + cx^2 + dx^3 + ex^4 + fx^5)
 * where x = bodyweight
 * 
 * Note: Modern PL uses Dots or IPF GL, but Wilks is classic and sufficient for this RPG.
 */

interface WilksParams {
    weightLifted: number; // in kg
    bodyWeight: number;   // in kg
    sex: 'male' | 'female';
}

export const calculateWilks = ({ weightLifted, bodyWeight, sex }: WilksParams): number => {
    const x = bodyWeight;

    let coeff = 0;

    if (sex === 'male') {
        const a = -216.0475144;
        const b = 16.2606339;
        const c = -0.002388645;
        const d = -0.00113732;
        const e = 7.01863E-06;
        const f = -1.291E-08;

        const denominator = a + b * x + c * Math.pow(x, 2) + d * Math.pow(x, 3) + e * Math.pow(x, 4) + f * Math.pow(x, 5);
        coeff = 500 / denominator;
    } else {
        const a = 594.31747775582;
        const b = -27.23842536447;
        const c = 0.82112226871;
        const d = -0.00930733913;
        const e = 4.731582E-05;
        const f = -9.054E-08;

        const denominator = a + b * x + c * Math.pow(x, 2) + d * Math.pow(x, 3) + e * Math.pow(x, 4) + f * Math.pow(x, 5);
        coeff = 500 / denominator;
    }

    return weightLifted * coeff;
};
