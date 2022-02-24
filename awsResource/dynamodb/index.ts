import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const basic_dynamodb_table = new aws.dynamodb.Table("accessRequest", {
  attributes: [
    {
      name: "Status",
      type: "S",
    },
    {
      name: "Username",
      type: "S",
    },
  ],
  billingMode: "PROVISIONED",
  hashKey: "Status",
  rangeKey: "Username",
  readCapacity: 10,
  writeCapacity: 10,
});
