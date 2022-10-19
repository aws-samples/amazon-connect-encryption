export const validate = (s: string, range: string) => {

    const isNumeric = /^\d+$/.test(s);
    if(!isNumeric) throw new Error('Expecting numeric value but got something else!');

    let isRange = /^\d+$|^\d\d*-\d\d*$/.test(range);
    if(!isRange) throw new Error(`Invalid range [${range}]!`);

    const tokens = range.split('-');
    const min = +tokens[0];
    const max = +tokens[1];

    isRange = min <= max; // min must be less than or equal to max
    if(!isRange) throw new Error(`Invalid range [${range}]!`);

    const len = s.length;
    return {
        isValid: len >= min && len <= max,
        min,
        max
    };
    
};