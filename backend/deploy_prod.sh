#!/bin/bash

docker build . --tag access-it
docker tag access-it us.gcr.io/access-it-303602/access-it
docker push us.gcr.io/access-it-303602/access-it