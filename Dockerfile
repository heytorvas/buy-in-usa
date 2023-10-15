FROM python:3.9

RUN apt-get update

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt