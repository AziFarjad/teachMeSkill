#!/usr/bin/env bash
cd lambda
rm index.zip
cd custom
zip  ../index.zip * –X -r
# read -n1 -r -p "Zip complete, press space to deploy..." key

cd ..
aws lambda update-function-code --function-name aws-serverless-repository-alexaskillskitnodejsfact-1I8RKFYK0DIRS --zip-file fileb://index.zip
cd ..
