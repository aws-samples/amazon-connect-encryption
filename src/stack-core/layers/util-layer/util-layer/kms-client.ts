import { EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
import { backOff } from 'exponential-backoff';
import { kmsClient } from "./aws";

export class KmsClient {

    private readonly kms = kmsClient;
    private readonly keyId: string;

    public constructor() {
        this.keyId = process.env.CMK_ALIAS!;			
        console.log(`KmsClient: keyId = [${this.keyId}]`);
    }

    public async encrypt(data: string) {
        
        const resp = await backOff(() => this.kms.send(new EncryptCommand({
            KeyId: this.keyId,
            Plaintext: Buffer.from(data)
        })));

        console.log(`KmsClient.encrypt: resp =`, resp);
        if(!resp?.CiphertextBlob) throw new Error('Failed to encrypt data');
        const result = Buffer.from(resp.CiphertextBlob).toString('base64');
		console.log(`KmsClient.encrypt: result = [${result}]`);
        return result;        
    }

    public async decrypt(data: string) {

		const resp = await backOff(() => this.kms.send(new DecryptCommand({
            CiphertextBlob: Buffer.from(data, 'base64')
        })));

        if(!resp?.Plaintext) throw new Error('Failed to decrypt data');
        return Buffer.from(resp.Plaintext).toString();
    }

} // class