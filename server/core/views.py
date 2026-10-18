from django.http import Http404
from django.template import TemplateDoesNotExist
from django.template.loader import get_template

from .helpers import render_template, view
from .processing_test import get_sketches


@view()
def index(request, *args, **kwargs):
    return render_template(
        request,
        "index.html",
        {
            "page": "index",
            "title": "Transitive Bullshit",
            "PROCESSING_SKETCHES": get_sketches(),
        },
    )


@view()
def processing(request, *args, **kwargs):
    sketches = get_sketches()
    sketch = kwargs.get("sketch")
    params = {}

    if sketch is not None:
        sketch = sketch.lower()
        if not any(s["name"] == sketch for s in sketches):
            sketch = None

    if sketch is not None:
        params["PROCESSING_SKETCH"] = sketch
    else:
        params["PROCESSING_SKETCHES"] = sketches

    params["page"] = "processing"
    params["title"] = "Transitive Bullshit - Processing Lab"
    params["bare"] = kwargs.get("bare", "").lower() in ("1", "true")

    return render_template(request, "processing.test.html", params)


def _render_named(request, name, context):
    template = f"{name}.html"
    try:
        get_template(template)
    except TemplateDoesNotExist as e:
        raise Http404(template) from e
    return render_template(request, template, context)


@view()
def test(request, *args, **kwargs):
    experiment = kwargs.get("experiment") or "turing"
    return _render_named(
        request,
        experiment,
        {"page": "test", "title": f"Transitive Bullshit - Lab - {experiment}"},
    )


@view()
def article(request, *args, **kwargs):
    return _render_named(request, kwargs["article"].strip().lower(), {})
