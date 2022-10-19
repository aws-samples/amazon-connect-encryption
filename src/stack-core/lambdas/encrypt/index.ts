import { KmsClient } from 'util-layer/kms-client';
import { validate } from 'util-layer/validate';

export async function handler(event: any, context: any) {

		const sensitive = event?.currentIntent?.slots?.authNumber || '';
		const sessionAttributes = event?.sessionAttributes || {};
		
		try {
			
			const range = sessionAttributes.range;
			console.log(`EncryptFn: range = [${range}]`);

			const validation = validate(sensitive, range);
			if(validation.isValid === false) throw new Error('Invalid input number or out of range!');

			sessionAttributes.isValid = 'true';
			const CC_LEN = process.env.CC_LEN!;
			const ZIP_LEN = +process.env.ZIP_LEN!;
			const len = sensitive.length;
			const kms = new KmsClient();

			if(range === CC_LEN && len >= validation.min && len <= validation.max) {
				sessionAttributes.creditcard = await kms.encrypt(sensitive);
			} else if(len === ZIP_LEN) {
				sessionAttributes.zipcode = await kms.encrypt(sensitive);
			} else {
				throw new Error(`Unexpected length [${len}]`);
			}			

		} catch(err: any) {
			console.error('EncryptFn:', err);
			sessionAttributes.isValid = 'false';
		}

		return formatResponse(sessionAttributes);

} // handler

const formatResponse = (sessionAttributes: any) => {
	return {
		sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
				'contentType': 'SSML',
				'content': '<speak> </speak>'
			}
        }
	};
};
