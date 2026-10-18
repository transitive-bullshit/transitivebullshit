# Contributing

## Setup

Requires [uv](https://docs.astral.sh/uv/). It installs Python 3.12 and Django from `uv.lock`.

```sh
uv sync
uv run python server/manage.py runserver   # http://localhost:8000
```

Or with Docker: `docker build -t old-site . && docker run -p 8000:8000 old-site`.

## Pages

| URL | View | Template |
| --- | --- | --- |
| `/` | `core.views.index` | `server/html/index.html` (includes every article) |
| `/processing`, `/processing?sketch=<name>` | `core.views.processing` | `server/html/processing.test.html` |
| `/test/<experiment>` | `core.views.test` | `server/assets/lab/<experiment>/<experiment>.html` |
| `/articles/<name>.html` | `core.views.article` | `server/articles/<name>.html` |
| `/assets/...` | static files | `server/assets/` |

Every page also answers under a legacy `/mobile/` prefix.

## Common tasks

- **Add a Processing sketch:** add the `.pde` under `server/assets/pde/<name>/`, a preview image under `server/assets/img/processing/`, and an entry in `server/core/processing_test.py`.
- **Edit styles:** edit the `.less` file next to its `.css` and recompile it, e.g. `npx -y less@4 server/assets/css/index.less server/assets/css/index.css`. The compiled CSS is committed.

## Tests and CI

```sh
uv run pytest -q
uv run ruff check . && uv run ruff format --check .
```

The tests render every page and article offline. CI (`.github/workflows/test.yml`) runs the same on push.

## Repo map

```
server/
  manage.py, settings.py, urls.py   Django project
  core/                             views, sketch list, {% custom_asset %} tag
  html/                             page templates
  articles/                         article templates
  assets/                           css/less, js (vendored libs), img, lab, pde, media
tests/                              smoke tests
deploy/                             2013 EC2/nginx/gunicorn configs (unmaintained, Python 2)
```

## Not in the repo, on purpose

- `.venv/` and caches; recreate with `uv sync`.
- The old production asset bundler (YUI compressor) and PhantomJS preview generator were removed; assets are now included individually. They remain in git history.
