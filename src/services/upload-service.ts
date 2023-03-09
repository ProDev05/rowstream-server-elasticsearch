import AWS from 'aws-sdk';

const s3Client = new AWS.S3({
  accessKeyId: 'AKIAUGSZOWQ7GN2DA57W',
  secretAccessKey: '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',
  region: 'ca-central-1',
});
const bucketName = 'rowstream-bucket';

const uploadParams = {
  Bucket: `${bucketName}`,
  Key: '', // pass key
  Body: '', // pass file body
  ACL: '',
};

export const uploadFile = async (file: any) => {
  return new Promise(async (resolve, reject) => {
    const params = uploadParams;
    uploadParams.Bucket = `${bucketName}/app`;
    uploadParams.Key = file.originalname;
    uploadParams.Body = file.buffer;
    uploadParams.ACL = 'public-read';

    await s3Client.upload(params, (error: any, data: any) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        reject(error);
      } else {
        // eslint-disable-next-line no-console
        console.log(data, 'successfully uploaded');
        resolve(data.Location);
      }
    });
  });
};

export async function multipleFile(data: any) {
  const files = Object.values(data);

  let promise;
  if (files.length > 0) {
    promise = await files.map(async (file) => {
      return await uploadFile(file);
    });
  } else {
    promise = await uploadFile(files);
    return promise;
  }

  return await Promise.all(promise);
}
