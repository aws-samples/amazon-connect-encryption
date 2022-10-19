import { Duration, Stack } from 'aws-cdk-lib';
import { IRestApi, MethodOptions } from 'aws-cdk-lib/aws-apigateway';
import {
	Effect,
	IRole,
	ManagedPolicy,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import {
	Code,
	Function,
	IEventSource,
	IFunction,
	ILayerVersion,
	LayerVersion,
	Runtime,
	Tracing
} from 'aws-cdk-lib/aws-lambda';
import { CfnParameter } from 'aws-cdk-lib/aws-ssm';

export class ResourceFactory {

	private static ROOT_DIR = 'bin/src';

	private readonly scope: Stack;
	private readonly stackName: string;
	private readonly lambdaDir: string;
	private readonly apiMap: Map<string, IRestApi>;
	private readonly runtimes: Runtime[];
	private readonly layers: Map<string, ILayerVersion>;

	public constructor(scope: Stack, stackDir: string) {
		this.scope = scope;
		this.lambdaDir = `${ResourceFactory.ROOT_DIR}/${stackDir}`;
		this.stackName = scope.stackName;
		this.runtimes = [ Runtime.NODEJS_14_X ];
		this.apiMap = new Map<string, IRestApi>();
		this.layers = new Map<string, ILayerVersion>();
	};

	/**
	 * This getter can be used to specify the REST API's default method
	 * options.  For example, here you can specify the authorizer type and
	 * authorizer itself.  You can always overwrite these options from the
	 * client stack.
	 *
	 * @returns the default REST API method options
	 */
	private get methodOptions(): MethodOptions {
		const options: MethodOptions = {
			// TODO: define default options.
		};
		return options;
	}

	createAllowPolicyStatement(resources: string[], actions: string[]) {
		return new PolicyStatement({
			actions,
			effect: Effect.ALLOW,
			resources
		});
	}

	createLambdaRole(id: string, statements: PolicyStatement[], boundary?: ManagedPolicy): IRole {
		
		const roleName = `${this.stackName}-${id}`;
		if(roleName.length > 64) throw Error(`Role name [${roleName}] exceeds 64 character max length!`);

		const basicActions = [
			'logs:*',
			'xray:PutTraceSegments',
			'xray:PutTelemetryRecords',
			'xray:GetSamplingRules',
			'xray:GetSamplingTargets',
			'xray:GetSamplingStatisticSummaries'
		];

		const basicPolicy = new PolicyStatement({
			actions: [...basicActions],
			resources: ['*']
		});

		return new Role(this.scope, id, {
			roleName,
			assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
			managedPolicies: [ ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole') ],
			permissionsBoundary: boundary,
			inlinePolicies: {
				lambdaPermissions: new PolicyDocument({
					assignSids: true,
					statements: [ basicPolicy, ...statements ]
				})
			}
		});

	}

	createLayerVersion(id: string, dir: string): ILayerVersion {
		let layer = this.layers.get(id);
		if(!layer) {
			layer = new LayerVersion(this.scope, id, {
				layerVersionName: `${this.stackName}-${id}`,
				code: Code.fromAsset(`${ResourceFactory.ROOT_DIR}/${dir}`),
				compatibleRuntimes: this.runtimes
			});
			this.layers.set(id, layer);
		}
		return layer;
	}

	createFunction(
		id: string,
		dir: string,
		role: IRole,
		env?: { [x:string]: string },
		layers?: ILayerVersion[],
		timeout: Duration = Duration.seconds(3),
		memorySize: number = 1024,
		tracing: Tracing = Tracing.DISABLED,
		events?: IEventSource[]
	): IFunction {
		return new Function(this.scope, id, {
			functionName: `${this.stackName}-${id}`,
			code: Code.fromAsset(`${this.lambdaDir}/lambdas/${dir}`),
			handler: 'index.handler',
			runtime: Runtime.NODEJS_14_X,
			environment: env,
			layers,
			role,
			timeout,
			tracing,
			memorySize,
			events
		});
	}

	createStringSsmPram(
		id: string,
		name: string,
		value: string,
		description?: string
	): CfnParameter {
		return new CfnParameter(this.scope, id, {
			dataType: 'text',
			description,
			name,
			value,
			type: 'String'
		});
	}

	createRole(id: string, principal: string, statements: PolicyStatement[], boundary?: ManagedPolicy): IRole {
		
		const roleName = `${this.stackName}-${id}`;
		if(roleName.length > 64) throw Error(`Role name [${roleName}] exceeds 64 character max length!`);

		return new Role(this.scope, id, {
			roleName,
			assumedBy: new ServicePrincipal(principal),
			managedPolicies: [ ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole') ],
			permissionsBoundary: boundary,
			inlinePolicies: {
				rolePermissions: new PolicyDocument({
					assignSids: true,
					statements
				})
			}
		});

	}

} // class