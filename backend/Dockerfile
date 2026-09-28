FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# Build dependencies are needed by packages such as psycopg2, Pillow, and Cairo.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
        build-essential \
        libcairo2-dev \
        libffi-dev \
        libjpeg62-turbo-dev \
        libpq-dev \
        libxml2-dev \
        libxslt1-dev \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system django \
    && adduser --system --ingroup django django

COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY --chown=django:django . ./
RUN chmod +x /app/start.sh \
    && mkdir -p /app/media /app/logs /app/staticfiles \
    && chown -R django:django /app

USER django

EXPOSE 8000

CMD ["/app/start.sh"]
