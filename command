#!/bin/sh

docker run -it --rm -u $(id -u):$(id -g) -v "$PWD":/usr/src/app -w /usr/src/app node:8.11.3-alpine $@
