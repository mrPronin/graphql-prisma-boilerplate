#!/bin/sh

SHA=$(git rev-parse --short=7 HEAD)
# echo $SHA
PROJECT_ID=graphql-prisma-boilerplate
# echo $PROJECT_ID

# Build local image
docker build -t api:latest -t api:$SHA .

# Tag 'latest' local image with the GCR registry name
docker tag api:latest gcr.io/$PROJECT_ID/api:latest

# Tag 'SHA' local image with the GCR registry name
docker tag api:$SHA gcr.io/$PROJECT_ID/api:$SHA

# Push 'latest' image to GRC
docker push gcr.io/$PROJECT_ID/api:latest
# docker push gcr.io/$PROJECT_ID/api:latest

# Push 'SHA' image to GRC
docker push gcr.io/$PROJECT_ID/api:$SHA

# Apply all configs in the 'k8s' folder
kubectl apply -f k8s

# Imperatively set SHA images on each deployment
kubectl set image deployments/api-deployment api=gcr.io/$PROJECT_ID/api:$SHA
