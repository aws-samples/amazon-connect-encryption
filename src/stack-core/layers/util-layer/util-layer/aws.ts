import { LexModelBuildingServiceClient } from '@aws-sdk/client-lex-model-building-service';

export const lexClient = new LexModelBuildingServiceClient({ region: process.env.AWS_REGION });
