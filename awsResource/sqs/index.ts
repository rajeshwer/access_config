import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const sqsQueue = (name: String) => {
  return new aws.sqs.Queue("accessRequest", {
    visibilityTimeoutSeconds: 60,
  });
};

const SecurityQueue = sqsQueue("accessRequest");

