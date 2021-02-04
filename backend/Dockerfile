FROM python:3.9-buster

RUN apt-get update \
    && apt-get upgrade -y \ 
    && apt-get install -y openjdk-11-jre-headless \ 
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade poetry==1.1.4

WORKDIR /application

RUN poetry config virtualenvs.create false

COPY poetry.lock poetry.lock
COPY pyproject.toml pyproject.toml
RUN poetry install --no-dev

RUN mkdir -p databases/ 

COPY src/ src/
COPY UCanAccess/ UCanAccess/
COPY main.py main.py

CMD uvicorn main:application --reload --host=0.0.0.0
