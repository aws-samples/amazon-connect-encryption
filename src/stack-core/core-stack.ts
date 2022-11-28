import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AccountPrincipal, ArnPrincipal, PolicyDocument, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Alias, Key } from 'aws-cdk-lib/aws-kms';
import { ResourceFactory } from '../common/resource-factory';
import { LexBotConstruct } from './lex-bot-construct';
import * as Names from '../common/names';

export class CoreStack extends Stack {

	constructor(scope: Construct, id: string, props?: StackProps) {

		super(scope, id, props);

		const factory = new ResourceFactory(this, 'stack-core');
		const stage = this.node.tryGetContext('stage') || Names.DEFAULT_STAGE;
		const name = this.node.tryGetContext('name') || Names.DEFAULT_NAME;
		const token = this.node.tryGetContext('token') || 'TOP_SECRET';
		const resources = [ '*' ];

		//-----------------------------------------------------
		// CREATE KMS RESOURCES
		//-----------------------------------------------------

		const kmsActions = [
			'kms:Decrypt',
			'kms:DescribeKey',
			'kms:Encrypt',
			'kms:GenerateDataKey',
			'kms:ReEncrypt*'
		];

		const primaryKey = new Key(this, 'PrimaryKey', {
			description: 'Symmetric key used to encrypt and decrypt data',
			policy: new PolicyDocument({
				statements: [
					new PolicyStatement({
						principals: [ new ArnPrincipal(`arn:aws:iam::${this.account}:root`)],
						actions: [ 'kms:*' ],
						resources
					}),
					new PolicyStatement({
						principals: [ new AccountPrincipal(this.account) ],
						actions: kmsActions,
						resources,
						conditions: {
							'StringEquals': {
								'kms:CallerAccount': this.account,
								'kms:ViaService': [
									`lambda.${this.region}.amazonaws.com`
								]
							}
						}
					})
				]
			})
		});

		const primaryKeyAlias = new Alias(this, 'PrimaryKeyAlias', {
			aliasName: `alias/primary-${stage}-${name}-key`,
			targetKey: primaryKey
		});

		const secondaryKey = new Key(this, 'SecondaryKey', {
			description: 'Symmetric key used to encrypt and decrypt the primary key',
			policy: new PolicyDocument({
				statements: [
					new PolicyStatement({
						principals: [ new ArnPrincipal(`arn:aws:iam::${this.account}:root`)],
						actions: [ 'kms:*' ],
						resources
					})
				]
			})
		});

		new Alias(this, 'SecondaryKeyAlias', {
			aliasName: `alias/secondary-${stage}-${name}-key`,
			targetKey: primaryKey
		});

		const encryptionContext = JSON.stringify({ stage, name, token });

		//-----------------------------------------------------
		// CREATE LAMBDA RESOURCES
		//-----------------------------------------------------

		const kmsPolicyStmt = factory.createAllowPolicyStatement(['*'], kmsActions);
		const cryptoLambdaRole = factory.createLambdaRole('CryptoRole', [ kmsPolicyStmt ]);
		const utilLayer = factory.createLayerVersion('UtilLayer', 'stack-core/layers/util-layer');

		const env = {
			PRIMARY_KEY: primaryKeyAlias.keyArn,
			SECONDARY_KEY: secondaryKey.keyArn,
			ENCRYPTION_CONTEXT: encryptionContext
		};
				
		const encryptFn = factory.createFunction(
			'EncryptFn',
			'encrypt',
			cryptoLambdaRole,
			{ 
				...env,
				CC_LEN: '15-16',
				ZIP_LEN: '5'
			},
			[ utilLayer ]
		);

		factory.createFunction(
			'DecryptFn',
			'decrypt',
			cryptoLambdaRole,
			env,
			[ utilLayer ]
		);

		//-----------------------------------------------------
		// CREATE LEX RESOURCES
		//-----------------------------------------------------
		const lexPrincipal = new ServicePrincipal('lex.amazonaws.com');

		encryptFn.addPermission('InvokePermission', {
			principal: lexPrincipal,
			action: 'lambda:InvokeFunction',
			sourceAccount: this.account
		});

		encryptFn.addPermission('InvokeAsyncPermission', {
			principal: lexPrincipal,
			action: 'lambda:InvokeAsync',
			sourceAccount: this.account
		});

		const lexActions = [
			'lex:PutBot',
			'lex:PutIntent',
			'lex:DeleteBot',
			'lex:DeleteIntent'						
		];

		const lexPolicyStmt = factory.createAllowPolicyStatement(['*'], lexActions);
		const botCustomResourceRole = factory.createLambdaRole('BotResourceRole', [ lexPolicyStmt ]);

		new LexBotConstruct(this, 'SecureInputLexBot', factory, {
			lambdaArn: encryptFn.functionArn,
			role: botCustomResourceRole,
			layer: utilLayer
		});

	} // constructor
	
} // class
