/**
 * Created by victorcrudu on 09/05/2016.
 */
import AWS from 'aws-sdk';

class AwsFactory{
    constructor() {
        let commonConfig = {
            accessKeyId: 'AKIAIUPQ643E2FNNHBGA',
            secretAccessKey: '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',
            region: 'eu-west-1',
            sslEnabled: true,
        };
        this._connectionOptions = {
            endpoint: 'https://dynamodb.eu-west-1.amazonaws.com',
            accessKeyId: commonConfig.accessKeyId,
            secretAccessKey: commonConfig.secretAccessKey,
            region: commonConfig.region,
            sslEnabled: commonConfig.sslEnabled,
            apiVersion: '2012-08-10',
            tablesSuffix: ''
        }
    }
    getDb(){
        return new AWS.DynamoDB(this._connectionOptions);
    }
    
    getS3Client(){
        let s3Client = new AWS.S3({
            apiVersion: '2006-03-01',
            endpoint: "s3-eu-west-1.amazonaws.com",
            accessKeyId: "AKIAJHYGK2RWWUKI5UTA",
            secretAccessKey: "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",
            sslEnabled: true
        });
        
        return s3Client;
    }

    getSnsClient(){
        return new AWS.SNS({apiVersion: '2010-03-31',
            endpoint:"https://sns.eu-west-1.amazonaws.com",
            accessKeyId:"AKIAJQ3AFCIJ3YVXQYXA",
            secretAccessKey:"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",
            sslEnabled:true
        });
    }
}

export default new AwsFactory();