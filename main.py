from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

# ── Create the FastAPI app ──
app = FastAPI()

# ── Serve everything in /static folder as static files ──
# Access them in HTML as /static/css/..., /static/js/..., etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Point to the folder where your HTML templates live ──
templates = Jinja2Templates(directory="templates")

# ── Template tags ──
from tools.template_tags import get_certificate_status, get_certificate_images
templates.env.globals["certificate_status"] = get_certificate_status # Note: we dont use '()' here because we want to use it as a function in the template, otherwise it will be called immediately and return the value which wont change if we add '()' to the function call in the template.
templates.env.globals["certificate_images"] = get_certificate_images()

# ── ROUTES ──
from routes.services import router as services_router
from routes.blog import router as blog_router
from routes.standard import router as standard_router

app.include_router(services_router)
app.include_router(blog_router)
app.include_router(standard_router)