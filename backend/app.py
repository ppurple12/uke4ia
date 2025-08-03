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


app.mount("/", StaticFiles(directory="frontend_dist", html=True), name="frontend")
app.mount("/images", StaticFiles(directory="./images"), name="images")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api") or full_path.startswith("images"):
        return {"detail": "Not found"}
    return FileResponse("frontend_dist/index.html")

@app.on_event("startup")
def check_files():
    print("INDEX EXISTS?", os.path.exists("frontend_dist/index.html"))