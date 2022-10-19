import { LexClient } from 'util-layer/lex-client';

export async function handler(event: any, context: any) {

		console.log('AssembleBotFn:', event);

		const lambdaArn = process.env.LAMBDA_ARN!;
		const lex = new LexClient();
		const intentName = 'inputValid';
		const botName = 'secure_LexInput';

		if(event.RequestType === 'Create') {

			const intent = await lex.createIntent(intentName, lambdaArn);
			console.log('AssembleBotFn: Lex intent created =', JSON.stringify(intent));

			const bot = await lex.createBot(botName, [{ intentName, intentVersion: intent.version }]);
			console.log('AssembleBotFn: Lex bot created =', JSON.stringify(bot));

			return {
				Status: 'SUCCESS',
				PhysicalResourceId: event.RequestId,
				Data: { Bot: bot.name }
			};

		 } else if(event.RequestType === 'Delete') {

			await lex.deleteBot(botName);
			console.log(`AssembleBotFn: Lex bot [${botName}] deleted`);

			await lex.deleteIntent(intentName);
			console.log(`AssembleBotFn: Lex intent [${intentName}] deleted`);
		}

		return { 
			Status: 'SUCCESS',
			PhysicalResourceId: event.PhysicalResourceId
		};

} // handler
