module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
	moduleFileExtensions: ['ts', 'js'],
	moduleNameMapper: {
		'/opt/util-layer/aws': '<rootDir>/src/stack-connect/layers/util-layer/util-layer/aws.ts',
		'/opt/util-layer/connect-client': '<rootDir>/src/stack-connect/layers/util-layer/util-layer/connect-client.ts',
		'/opt/util-layer/env-utils': '<rootDir>/src/stack-connect/layers/util-layer/util-layer/env-utils.ts'
	},
	collectCoverageFrom: [
		'**/*.ts',
		'!**/*.d.ts',
		'!cdk.out/**/*',
		'!bin/**/*',
		'!webpack.config.ts'
	]
};
