# AGENTS.md

Travis Fischer's 2013 portfolio site: a small Django 5 app (Python 3.12, uv) with no database. See `contributing.md` for setup, commands, and the URL → template map.

## Mental model

`server/urls.py` → `server/core/views.py` → Django templates in `server/html/`, `server/articles/`, and `server/assets/lab/*/`. Static files are served from `server/assets/` at `/assets/`. The Processing sketch list lives in `server/core/processing_test.py`.

## Edit sources, not outputs

- `.less` files are the sources for their sibling `.css` files; both are committed.
- `server/assets/js/libs/` is vendored third-party code; don't reformat or modernize it.
- `server/assets/gen/` was the old bundle output and is ignored.

## Conventions

- `uv run pytest -q` and `uv run ruff check . && uv run ruff format --check .` must pass.
- `deploy/` is legacy Python 2 infra, excluded from ruff and unmaintained.

## Not in git

- `README.md` is marketing; technical docs go in `contributing.md`.
