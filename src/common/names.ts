export const DEFAULT_NAME = 'encryption';
export const DEFAULT_STAGE = 'dev';
export const DEFAULT_SEQ = '001';

// CFN OUTPUT NAMES
export const CFN_UTIL_LAYER_ARN = 'UtilLayerARN';
export const CFN_REL_BUCKET_NAME = 'ReleaseBucketName';
export const CFN_REL_BUCKET_ARN = 'ReleaseBucketARN';
export const CFN_REL_VERSION = 'ReleaseVersion';
export const CFN_CONNECT_INSTANCE_ID = 'ConnectInstanceID';

// SSM PARAMETER NAMES
export const SSM_UTIL_LAYER_ARN = '/{STAGE}/ccaas/lambda/layer/util/arn';
export const SSM_REL_BUCKET_NAME = '/{STAGE}/ccaas/release/bucket/name';
export const SSM_REL_BUCKET_ARN = '/{STAGE}/ccaas/release/bucket/arn';
export const SSM_REL_VERSION = '/{STAGE}/ccaas/release/version';
export const SSM_CONNECT_INSTANCE_ID = '/{STAGE}/ccaas/connect/instance/id';
