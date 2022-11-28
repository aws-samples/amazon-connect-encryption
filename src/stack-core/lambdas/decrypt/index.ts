import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';

export async function handler(event: any, context: any) {

		console.log('DecryptFn:', event);
		let resp: { Status: string; Data: string; };
		
		try {
			
			const encrypted = event.Details?.Parameters?.encrypted || '';
			console.log(`DecryptFn: encrypted = [${encrypted}]`);
			if(!encrypted) throw new Error(`Parameter is null or blank: [encrypted]`);
						
			// Set up for encryption SDK
			const keyIds = [ process.env.WRAPPER_KEY! ];
			const keyRing = new KmsKeyringNode({ keyIds });
			const { decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);			
			const { plaintext } = await decrypt(keyRing, Buffer.from(encrypted, 'base64'));
			resp = { Status: 'OK', Data: plaintext.toString() };

		} catch(err: any) {
			console.error('DecryptFn:', err);
			resp = { Status: 'ERROR', Data: err.message as string }
		}

		return resp;

} // handler
