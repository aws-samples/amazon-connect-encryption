import { CustomResource, Duration, ResourceProps } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { ILayerVersion } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { ResourceFactory } from "../common/resource-factory";

export interface LexBotConstructProps extends ResourceProps {
    readonly lambdaArn: string;
    readonly role: IRole;
    readonly layer: ILayerVersion;
}

export class LexBotConstruct extends Construct {

    public readonly arn: string;

    constructor(
        scope: Construct,
        id: string,
        factory: ResourceFactory,
        props: LexBotConstructProps
    ) {
        super(scope, id);

        const fn = factory.createFunction(
			'AssembleLexBotFn',
			'assemble-lex-bot',
			props.role,
			{ LAMBDA_ARN: props.lambdaArn },
			[ props.layer ],
			Duration.minutes(10),
            1024
		);

        const provider = new Provider(this, 'LexBotProvider', {
            onEventHandler: fn,
            logRetention: RetentionDays.THREE_MONTHS
        });

		const cr = new CustomResource(this, 'LexBotResource', {
			serviceToken: provider.serviceToken
		});

    }

}