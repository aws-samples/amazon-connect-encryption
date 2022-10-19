import {
    PutBotCommand,
    DeleteBotCommand,
    PutIntentCommand,
    DeleteIntentCommand
} from '@aws-sdk/client-lex-model-building-service';
import { backOff } from 'exponential-backoff';
import { lexClient } from "./aws";

export class LexClient {

    private readonly lex = lexClient;

    public constructor() {
    }

    public async createBot(
        name: string,
        intents: {
            intentName: string;
            intentVersion: string;
        }[],
        locale = 'en-US'
    ) {        
        const resp = await backOff(() => this.lex.send(new PutBotCommand({
            name,
            createVersion: true,
            intents,
            childDirected: false,
            voiceId: 'Joanna',
            locale,
            idleSessionTTLInSeconds: 300,
            abortStatement: {
                messages: [{
                    contentType: 'SSML',
                    content: '<speak></speak>'
                }]
            }, 
            processBehavior: 'BUILD'
        })));

        console.log(`LexClient.createBot: resp =`, resp);
        if(!resp?.version) throw new Error(`Failed to create bot [${name}]`);        
        return { name, version: resp.version, status: resp.status };
    }

    public async deleteBot(name: string) {     
        const resp = await backOff(() => this.lex.send(new DeleteBotCommand({ name })));
        const status = resp?.$metadata.httpStatusCode ?? 500;
        console.log(`LexClient.deleteBot: resp =`, resp);
        if(status < 200 || status >= 300) throw new Error(`Failed to delete bot [${name}]`);   
    }

    public async createIntent(name: string, lambdaArn: string) {

        const resp = await backOff(() => this.lex.send(new PutIntentCommand({
            name,
            createVersion: true,
            fulfillmentActivity: {
                codeHook: {
                    uri: lambdaArn,
                    messageVersion: "1.0"
                },
                type: 'CodeHook'
            },
            sampleUtterances: ['{authNumber}'],
            slots: [{
                name: 'authNumber',
                slotType: 'AMAZON.NUMBER',
                obfuscationSetting: 'DEFAULT_OBFUSCATION',
                slotConstraint: 'Required',
                valueElicitationPrompt: {
                    messages: [{
                        contentType: 'PlainText',
                        content: 'Enter nmber'
                    }],
                    maxAttempts: 2,
                    responseCard: JSON.stringify({
                        version: 1,
                        contentType: 'application/vnd.amazonaws.card.generic'
                    })
                },
                priority: 1
            }]
        })));

        console.log('LexClient.createIntent: resp =', resp);
        if(!resp?.version) throw new Error(`Failed to create intent [${name}]`);
        return { name, version: resp.version };
    }

    public async deleteIntent(name: string) {     
        const resp = await backOff(() => this.lex.send(new DeleteIntentCommand({ name })));
        const status = resp?.$metadata.httpStatusCode ?? 500;
        console.log(`LexClient.deleteIntent: resp =`, resp);
        if(status < 200 || status >= 300) throw new Error(`Failed to delete intent [${name}]`);   
    }

} // class