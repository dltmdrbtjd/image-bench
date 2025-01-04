FROM golang:1.23

RUN apt-get update && \
    apt-get install -y libvips-dev

WORKDIR /app

COPY . .

RUN go mod tidy
CMD ["go", "run", "main.go"]