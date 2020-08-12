# Notification API k8s

Docker / Kubernetes sample application API.

## Create a new version

1. Build a new docker image

   ```
   $ docker build --no-cache -t bespinian/notification-api .
   ```

1. Push the docker image to the registry

   ```
   $ docker push bespinian/notification-api:latest
   ```

## Requirements to run

- Assumes that there exists a MongoDB service named `notification-db`
- Assumes that there exists a RabbitMQ service named `notification-mq`

## Deployment

Use [these YAML files](https://github.com/bespinian/notification-k8s).
