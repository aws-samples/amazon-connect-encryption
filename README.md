## Amazon Connect and Lex Secure Input

This sample project demonstrates how to encrypt sensitive data such as PCI and PII collected through Amazon Connect and an Amazon Lex conversational bot. Included in this CDK-based project are:

- Automated deployment of AWS Lambda functions, AWS Key Management Service encryption keys and a sample Amazon Lex bot
- A sample Amazon Connect contact flow that leverages the Lex input bot an Lambda functions to encrypt a credit card number and zip code.

### Pre-Requisites

- An AWS account with system administrator and programmatic access
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node & NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) - See [supported AWS Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- [TypeScript](https://www.typescriptlang.org/download)
- [Cloud Development Kit (CDK) 2.0 or higher](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)

### Getting Started

1. Clone the project source files from the [GitHub](https://github.com/aws-samples/connect-encryption) repository
1. From the command line, `cd` to the project's root directory
1. Run `npm install`
1. Run `npm run build` to transpile TypeScript to JavaScript and packages code and its dependencies before deploying to AWS
1. Run `cdk deploy CoreStack`
1. Create an Amazon Connect instance if one is not already available
1. From the AWS Amazon Connect console, select the target Connect instance and click on the Contact Flows option
1. Associate the secure_LexInput bot to the Connect instance
1. Log into the Amazon Connect Administrative Console and create a new contact flow called Secure_Lex_Input by importing this file
1. Save and publish the contact flow
1. Associate a DID to the newly published contact flow
1. Make a test call entering a fake 16-digit credit card number and zip code when prompted
1. Once call is completed, validate through the CloudWatch logs that both values were encrypted

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

