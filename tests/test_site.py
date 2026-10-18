import pytest

from core.processing_test import get_sketches

PAGES = [
    "/",
    "/index.html",
    "/mobile/",
    "/processing",
    "/processing?sketch=rrt",
    "/test",
    "/test/origami",
    "/test/flocking_audio",
    "/test/processing_three",
    "/articles/about.html",
    "/articles/stamped_be.html",
]


@pytest.mark.parametrize("path", PAGES)
def test_page_renders(client, path):
    response = client.get(path)
    assert response.status_code == 200, path


def test_index_lists_every_sketch(client):
    html = client.get("/").content.decode()
    for sketch in get_sketches():
        assert f"sketch-{sketch['name']}" in html


def test_index_assets_exist(client):
    html = client.get("/").content.decode()
    assert '<link rel="stylesheet" href="/assets/css/index.css">' in html
    assert client.get("/assets/css/index.css").status_code == 200
    assert client.get("/assets/js/index.js").status_code == 200


def test_unknown_article_404s(client):
    assert client.get("/articles/nope.html").status_code == 404
