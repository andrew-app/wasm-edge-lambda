FROM rust:slim
RUN apt-get update && apt-get install -y clang
COPY . /app
WORKDIR /app
RUN cargo install wasm-pack