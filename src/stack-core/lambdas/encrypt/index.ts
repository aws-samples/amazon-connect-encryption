import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';
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
			
			// Set up for encryption SDK
			const generatorKeyId = process.env.PRIMARY_KEY!;
			const keyIds = [ process.env.WRAPPER_KEY! ];
			const keyRing = new KmsKeyringNode({ generatorKeyId, keyIds });
			const { encrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);
			const CONTEXT = typeof process.env.ENCRYPTION_CONTEXT === 'string'
				? JSON.parse(process.env.ENCRYPTION_CONTEXT) : undefined;

			if(range === CC_LEN && len >= validation.min && len <= validation.max) {
				const { result } = await encrypt(keyRing, sensitive, { encryptionContext: CONTEXT});
				sessionAttributes.creditcard = result.toString('base64');
			} else if(len === ZIP_LEN) {
				const { result } = await encrypt(keyRing, sensitive, { encryptionContext: CONTEXT});
				sessionAttributes.zipcode = result.toString('base64');
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
