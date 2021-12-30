#!/bin/bash

rm -rf build
yarn build:prod
gsutil -m cp -R build/* gs://access-it.me

