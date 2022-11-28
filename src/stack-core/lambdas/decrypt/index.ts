import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';

export async function handler(event: any, context: any) {

		console.log('DecryptFn:', event);
		let resp: { Status: string; Data: string; };
		
		try {
			
			const encrypted = event.Details?.Parameters?.encrypted || '';
			console.log(`DecryptFn: encrypted = [${encrypted}]`);
			if(!encrypted) throw new Error(`Parameter is null or blank: [encrypted]`);

			const CONTEXT = typeof process.env.ENCRYPTION_CONTEXT === 'string'
				? JSON.parse(process.env.ENCRYPTION_CONTEXT) : undefined;
						
			// Set up for encryption SDK
			const keyIds = [ process.env.WRAPPER_KEY! ];
			const keyRing = new KmsKeyringNode({ keyIds });
			const { decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);			
			const { plaintext, messageHeader } = await decrypt(keyRing, Buffer.from(encrypted, 'base64'));
			const { encryptionContext } = messageHeader;

			Object.entries(CONTEXT).forEach(([key, value]) => {
				if (encryptionContext[key] !== value) throw new Error('Encryption Context does not match expected values')
			});

			resp = { Status: 'OK', Data: plaintext.toString() };

		} catch(err: any) {
			console.error('DecryptFn:', err);
			resp = { Status: 'ERROR', Data: err.message as string }
		}

		return resp;

} // handler
