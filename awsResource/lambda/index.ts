import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { lambda } from "@pulumi/aws/types/enums";
import { getArn } from "@pulumi/aws";

const role = new aws.iam.Role("lambdaRole", {
  name: "lambdaRole123",
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});

const policy = new aws.iam.Policy("feb20", {
  description: "policy to use sqs as trigger for lambda function",
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "VisualEditor0",
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGetItem",
          "dynamodb:PutItem",
          "dynamodb:DescribeTable",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:UpdateTable",
          "dynamodb:GetRecords",
        ],
        Resource: "*",
      },
      {
        Sid: "VisualEditor1",
        Effect: "Allow",
        Action: [
          "sqs:DeleteMessage",
          "sqs:GetQueueUrl",
          "sqs:ListDeadLetterSourceQueues",
          "sqs:ChangeMessageVisibility",
          "sqs:PurgeQueue",
          "sqs:ReceiveMessage",
          "sqs:DeleteQueue",
          "sqs:SendMessage",
          "sqs:GetQueueAttributes",
          "sqs:ListQueueTags",
          "sqs:CreateQueue",
          "sqs:SetQueueAttributes",
        ],
        Resource: "arn:aws:sqs:us-west-2:141231375059:feb20-c61a98b",
      },
    ],
  },
});

new aws.iam.RolePolicyAttachment(`lambdaRoleAttachment`, {
  role: role.name,
  policyArn: policy.arn,
});

new aws.iam.RolePolicyAttachment(`lambda-basic-execution`, {
  role: role.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

const ProvideAccess = new aws.lambda.Function("ProvideAccess", {
  name: "ProvideAccess",
  runtime: "go1.x",
  handler: "dynamo",
  s3Bucket: "lambdafunction-53ae4fb",
  s3Key: "dynamo.zip",
  role: role.arn,
  timeout: 60,
});

const RevokeAccess = new aws.lambda.Function("RevokeAccess", {
  name: "RevokeAccess",
  runtime: "go1.x",
  handler: "cron",
  s3Bucket: "lambdafunction-53ae4fb",
  s3Key: "cron.zip",
  role: role.arn,
  timeout: 60,
});

const triggerProvideAccess = new aws.lambda.EventSourceMapping(
  "triggerProvideAccess",
  {
    eventSourceArn: "arn:aws:sqs:us-west-2:141231375059:feb20-c61a98b",
    functionName: ProvideAccess.arn,
  },
  {
    dependsOn: [ProvideAccess],
  }
);

const cron = new aws.cloudwatch.EventRule("console", {
  description: "Capture each AWS Console Sign In",
  scheduleExpression: "rate(1 minute)",
});


const target = new aws.cloudwatch.EventTarget(`revokeaccesslambdatarget`, {
  rule: cron.name,
  arn: RevokeAccess.arn,
});

const allowCloudwatch = new aws.lambda.Permission("allowCloudwatch", {
  action: "lambda:InvokeFunction",
  function: RevokeAccess.arn,
  principal: "events.amazonaws.com",
  sourceArn: cron.arn,
});

