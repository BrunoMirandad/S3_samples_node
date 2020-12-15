const express = require('express');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const { json, request, response } = require('express');

const app = express();

app.use(express.json());

// cria objeto S3 service
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

AWS.config.getCredentials(function(err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
      console.log("🔑Access key:", AWS.config.credentials.accessKeyId);
    }
  });
  
app.get('/s3list', async (request, response) =>{
  await s3.listBuckets().promise().then(
    function(err,data){
      if(err){
        return response.json(err);
      }else{
        return response,json(data.Buckets);
      }
    }
  )
});

app.get('/s3Object',(request,response)=>{
  const {bucketName, key } = request.body;
  const objectParams = {Bucket: bucketName, Key: key};
  s3.getObject(objectParams).promise().then(function(data){
    return response.json(data);
  }).catch(function(err){
    console.error(err, err.stack);
    return response.json(err);
  });
});

app.post('/s3newbucket',(request, response) =>{
  const {bucketName} = request.body;
  // Cria uma promise no S3 service 
  s3.createBucket({Bucket: bucketName}).promise().then(
    function(data){
      return response.json(data);
    }).catch(function(err){
      console.error(err, err.stack);
      return response.json(err);
  });
});

app.post('/s3uploadObject',(request,response)=>{

  const {bucketName, filename, filePath} = request.body;

  const objectParams = {Bucket: bucketName, Key: filename, Body: ''}

  const fs = require('fs');
  const fileStream = fs.createReadStream(filePath);
  fileStream.on('error', function(err) {
    console.log('File Error', err);
  });

  objectParams.Body = fileStream;

  s3.putObject(objectParams).promise().then(
    function(data){
      return response.json(data);
    }).catch(function(err){
      console.error(err, err.stack);
      return response.json(err);
    });
});

app.delete('/delete',(request,response) => {
  const { bucketName, key } = request.body;
  const objectParams = { Bucket: bucketName, Key: key };
  s3.deleteObject(objectParams).promise().then(
    function(data){
      return response.json(data);
  }).catch(function(err){
    console.error(err, err.stack);
  });
});




app.listen(3333, ()=>{
    console.log('S3 teste STARTED! 🐱‍👤- gato ninja')
});