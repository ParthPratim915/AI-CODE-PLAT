FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    nodejs npm \
    openjdk-17-jdk \
    g++ gcc \
    golang \
    rustc cargo \
    php-cli \
    ruby \
    mono-runtime mono-mcs \
    bash \
    timeout \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY runner.sh /runner.sh
RUN chmod +x /runner.sh

ENTRYPOINT ["/runner.sh"]
