import { KmsClient } from 'util-layer/kms-client';

export async function handler(event: any, context: any) {

		console.log('DecryptFn:', event);
		let resp: { Status: string; Data: string; };
		
		try {
			
			const encrypted = event.Details?.Parameters?.encrypted || '';
			console.log(`DecryptFn: encrypted = [${encrypted}]`);
			if(!encrypted) throw new Error(`Parameter is null or blank: [encrypted]`);
			
			const kms = new KmsClient();
			const data = await kms.decrypt(encrypted);
			resp = { Status: 'OK', Data: data };

		} catch(err: any) {
			console.error('DecryptFn:', err);
			resp = { Status: 'ERROR', Data: err.message as string }
		}

		return resp;

} // handler
