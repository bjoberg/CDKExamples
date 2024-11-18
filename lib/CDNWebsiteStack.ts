import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as CloudFront from 'aws-cdk-lib/aws-cloudfront';
import * as CloudFrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as S3 from 'aws-cdk-lib/aws-s3';

export default class CDNWebsiteStack extends cdk.Stack {
  private readonly _distribution: CloudFront.Distribution;
  private readonly _bucket: S3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const prefix = 'CDNWebsite';

    this._bucket = new S3.Bucket(this, `${prefix}Bucket`, {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
    });

    const s3BucketOrigin =
      CloudFrontOrigins.S3BucketOrigin.withOriginAccessControl(this._bucket);

    this._distribution = new CloudFront.Distribution(
      this,
      `${prefix}Distribution`,
      {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new CloudFrontOrigins.OriginGroup({
            primaryOrigin: s3BucketOrigin,
            fallbackOrigin: s3BucketOrigin,
          }),
          cachePolicy: CloudFront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy:
            CloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.hours(1),
          },
        ],
      }
    );
  }

  get distribution(): CloudFront.Distribution {
    return this._distribution;
  }

  get bucket(): S3.Bucket {
    return this._bucket;
  }
}
