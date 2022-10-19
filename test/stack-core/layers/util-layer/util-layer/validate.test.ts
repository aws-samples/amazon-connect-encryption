import { validate } from '../../../../../src/stack-core/layers/util-layer/util-layer/validate';

it('Should return true for valid numeric value within range', () => {
    expect(validate('12345', '1-5')).toBe(true);
    expect(validate('0', '1-5')).toBe(true);
    expect(validate('1', '1-1')).toBe(true);
});

it('Should return false for valid numeric value outside range', () => {
    expect(validate('12345', '1-4')).toBe(false);
    expect(validate('0', '9-12')).toBe(false);
});

it('Should throw error for non-numeric value within range', () => {    
	try {
		validate('12C4567', '1-7');
	} catch(err: any) {
		expect(err.message).toContain('Expecting numeric');
	}
});

it('Should throw error for numeric value with invalid range', () => {    
	try {
		validate('1234567', 'A-Z');
	} catch(err: any) {
		expect(err.message).toContain('Invalid range');
	}
});

it('Should throw error for numeric value with min greater than max in range', () => {    
	try {
		validate('1234567', '7-1');
	} catch(err: any) {
		expect(err.message).toContain('Invalid range');
	}
});