import { KMSClient } from '@aws-sdk/client-kms';
import { LexModelBuildingServiceClient } from '@aws-sdk/client-lex-model-building-service';

export const kmsClient = new KMSClient({ region: process.env.AWS_REGION });
export const lexClient = new LexModelBuildingServiceClient({ region: process.env.AWS_REGION });
