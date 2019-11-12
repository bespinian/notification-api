# notification-api-k8s

Docker / kubernetes sample application API.

## Create a new version

1. Build a new docker image

```
docker build --no-cache -t mathiskretz/notification-api .
```

3. Push the docker image to Artifactory

```
docker push mathiskretz/notification-api:latest
```

## Requirements to run

1. Assumes that there exists a MongoDB service named `notification-db`
2. Assumes that there exists a RabbitMQ service named `notification-mq`

## Deployment

Use [these YAML files](https://github.com/bespinian/notification-k8s).
