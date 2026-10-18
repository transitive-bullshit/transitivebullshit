FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim
WORKDIR /app
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev
COPY server ./server
ENV DJANGO_ALLOWED_HOSTS=*
EXPOSE 8000
CMD ["uv", "run", "--frozen", "--no-dev", "python", "server/manage.py", "runserver", "0.0.0.0:8000"]
