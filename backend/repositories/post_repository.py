from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sql_connector import get_db  # your DB session dependency
from schemas import BLOG_POST_BASE, BLOG_POST_RESPONSE
from models import BLOG_POST
from typing import Optional, List
import os, shutil
from datetime import date, datetime

router = APIRouter()


@router.get("/", response_model=List[BLOG_POST_RESPONSE])
def list_blogposts(
    page: int = Query(1, ge=1),
    limit: int = Query(3, ge=1, le=20),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    posts = (
        db.query(BLOG_POST)
        .order_by(BLOG_POST.POST_DATE.desc(), BLOG_POST.POST_ID.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return posts

@router.get("/count")
def get_post_count(db: Session = Depends(get_db)):
    count = db.query(BLOG_POST).count()
    return {"totalCount": count}


@router.post("/create")
async def create_blogpost(
    POST_TITLE: str = Form(...),
    POST_CONTENTS: str = Form(...),
    POST_IMAGE: UploadFile | None = File(None),
    POST_AUTHOR: int = Form(...),  # <-- user ID from frontend
    db: Session = Depends(get_db),
):
    image_filename = None
    if POST_IMAGE:
        if POST_IMAGE.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(400, "Only JPG and PNG images allowed")

        ext = ".jpg" if POST_IMAGE.content_type == "image/jpeg" else ".png"
        filename = f"blog_{POST_AUTHOR}_{int(datetime.utcnow().timestamp())}{ext}"
        save_dir = "./images/blog"
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, filename)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(POST_IMAGE.file, buffer)

        image_filename = f"/images/blog/{filename}"


    new_post = BLOG_POST(
        POST_TITLE=POST_TITLE,
        POST_CONTENTS=POST_CONTENTS,
        POST_IMAGE=image_filename,
        POST_AUTHOR=POST_AUTHOR,
        POST_DATE=datetime.utcnow().date()
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {"message": "Blog post created", "post_id": new_post.POST_ID}

@router.get("/blogposts/{post_id}")
def get_blogpost(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BLOG_POST).filter(BLOG_POST.POST_ID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

@router.put("/blogposts/{post_id}")
async def update_blogpost(
    post_id: int,
    POST_TITLE: str = Form(...),
    POST_CONTENTS: str = Form(...),
    POST_IMAGE: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    post = db.query(BLOG_POST).filter(BLOG_POST.POST_ID == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.POST_TITLE = POST_TITLE
    post.POST_CONTENTS = POST_CONTENTS

    if POST_IMAGE:
        uploads_dir = "uploads"
        os.makedirs(uploads_dir, exist_ok=True)
        filename = POST_IMAGE.filename
        path = os.path.join(uploads_dir, filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(POST_IMAGE.file, buffer)
        post.POST_IMAGE = filename

    db.commit()
    db.refresh(post)
    return post
