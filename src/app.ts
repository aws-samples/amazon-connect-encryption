#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CoreStack } from './stack-core/core-stack';
import { DEFAULT_NAME, DEFAULT_STAGE } from './common/names';

const app = new App();
const stage = app.node.tryGetContext('stage') || DEFAULT_STAGE;
const name = app.node.tryGetContext('name') || DEFAULT_NAME;
const prefix = `${stage}-${name}`;

new CoreStack(app, 'CoreStack', {
  stackName: `${prefix}-core`,
  description: 'Core application stack'
});