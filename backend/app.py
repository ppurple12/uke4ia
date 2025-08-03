from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from repositories.post_repository import router as post_router
from repositories.member_repository import router as member_router
from repositories.show_repository import router as show_router
from fastapi.responses import FileResponse
from fastapi import Request
import os
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use your frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(post_router,  prefix="/api")
app.include_router(member_router, prefix="/api")
app.include_router(show_router, prefix="/api")

# Mount frontend
app.mount("/", StaticFiles(directory="frontend_dist", html=True), name="frontend")
app.mount("/images", StaticFiles(directory="./images"), name="images")

@app.get("/{full_path:path}")
def serve_react_app(request: Request, full_path: str):
    # If it's an API call, return 404 (we don't want to serve index.html for API errors)
    if full_path.startswith("api") or full_path.startswith("images"):
        return {"detail": "Not found"}
    
    index_path = os.path.join("frontend_dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "index.html not found"}