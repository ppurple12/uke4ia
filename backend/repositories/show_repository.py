from fastapi import APIRouter, Depends,  UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session, aliased
from datetime import date
from sql_connector import get_db  
from models import SHOWS, MEMBERS, AVAILABLE_MEMBERS
from schemas import MemberAvailabilityResponse, AVAILABILITY_ENUM, AvailabilityUpdate
from typing import List
from typing import Optional
from datetime import date, time
import os, shutil
router = APIRouter()

@router.get("/past_concerts")
def get_past_concerts(db: Session = Depends(get_db)):
    today = date.today()
    concerts = db.query(SHOWS).filter(SHOWS.SHOW_DATE < today).order_by(SHOWS.SHOW_DATE.desc()).all()
    return concerts

@router.get("/upcoming_concerts")
def get_upcoming_concerts(db: Session = Depends(get_db)):
    today = date.today()
    concerts = db.query(SHOWS).filter(SHOWS.SHOW_DATE >= today).order_by(SHOWS.SHOW_DATE.asc()).all()
    if not concerts:
        raise HTTPException(status_code=404, detail="No upcoming concerts found")
    return concerts

@router.get("/concerts/{show_id}", response_model=dict)
def get_show_by_id(show_id: int, db: Session = Depends(get_db)):
    show = db.query(SHOWS).filter(SHOWS.SHOW_ID == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    print(show.SHOW_NAME)
    return {
        "SHOW_ID": show.SHOW_ID,
        "SHOW_NAME": show.SHOW_NAME,
        "SHOW_DESCRIPTION": show.SHOW_DESCRIPTION,
        "SHOW_DATE": show.SHOW_DATE,
        "SHOW_TIME": show.SHOW_TIME,
        "SHOW_LOCATION": show.SHOW_LOCATION,
        "YOUTUBE_LINK": show.YOUTUBE_LINK,
        "IMAGE_URL": show.IMAGE_URL,
    }


@router.put("/concerts/{show_id}")
async def update_concert_with_file(
    show_id: int,
    SHOW_NAME: str = Form(...),
    SHOW_DESCRIPTION: str = Form(...),
    SHOW_DATE: str = Form(...),
    SHOW_TIME: str = Form(...),
    SHOW_LOCATION: str = Form(...),
    YOUTUBE_LINK: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    concert = db.query(SHOWS).filter(SHOWS.SHOW_ID == show_id).first()
    if not concert:
        raise HTTPException(status_code=404, detail="Concert not found")

    # Update fields
    concert.SHOW_NAME = SHOW_NAME
    concert.SHOW_DESCRIPTION = SHOW_DESCRIPTION
    concert.SHOW_DATE = date.fromisoformat(SHOW_DATE)
    concert.SHOW_TIME =  None if SHOW_TIME in ["null", ""] else SHOW_TIME
    concert.SHOW_LOCATION = SHOW_LOCATION
    concert.YOUTUBE_LINK = YOUTUBE_LINK

    # Image upload
    if image:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Only JPEG and PNG allowed")

        ext = ".jpg" if image.content_type == "image/jpeg" else ".png"
        save_path = f"./images/{show_id}{ext}"
        os.makedirs("./images", exist_ok=True)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        concert.IMAGE_URL = f"/images/{show_id}{ext}"

    db.commit()
    db.refresh(concert)
    return concert

@router.get("/shows/{show_id}/members", response_model=List[MemberAvailabilityResponse])
def get_show_members(show_id: int, db: Session = Depends(get_db)):
    avail_alias = aliased(AVAILABLE_MEMBERS)

    results = (
        db.query(
            MEMBERS.USER_ID,
            MEMBERS.MEMBER_NAME,
            avail_alias.MEMBER_AVAILABILITY
        )
        .outerjoin(
            avail_alias,
            (MEMBERS.USER_ID == avail_alias.USER_ID) &
            (avail_alias.SHOW_ID == show_id)
        )
        .all()
    )

    # Set default if MEMBER_AVAILABILITY is None
    for row in results:
        print(row.MEMBER_AVAILABILITY)
    return [
        {
            "USER_ID": row.USER_ID,
            "MEMBER_NAME": row.MEMBER_NAME,
            "MEMBER_AVAILABILITY": row.MEMBER_AVAILABILITY or AVAILABILITY_ENUM.NO
        }
        for row in results]

@router.post("/concerts/{show_id}/availability")
async def set_availability(
    show_id: int,
    update: AvailabilityUpdate,
    db: Session = Depends(get_db)
):
    print("Availability enum received:", update.MEMBER_AVAILABILITY)
    print("Availability string value:", update.MEMBER_AVAILABILITY.name)
    # Check if show exists
    show = db.query(SHOWS).filter(SHOWS.SHOW_ID == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    # Check if user exists
    user = db.query(MEMBERS).filter(MEMBERS.USER_ID == update.USER_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find existing availability record if any
    availability = (
        db.query(AVAILABLE_MEMBERS)
        .filter(AVAILABLE_MEMBERS.SHOW_ID == show_id, AVAILABLE_MEMBERS.USER_ID == update.USER_ID)
        .first()
    )
    avail_status = update.MEMBER_AVAILABILITY.value
    if availability:
        # Update existing availability
        availability.MEMBER_AVAILABILITY = avail_status
    else:
        # Create new availability record
        availability = AVAILABLE_MEMBERS(
            SHOW_ID=show_id,
            USER_ID=update.USER_ID,
            MEMBER_AVAILABILITY=avail_status,
        )
        db.add(availability)

    db.commit()
    db.refresh(availability)

    return {"message": "Availability updated", "availability": availability.MEMBER_AVAILABILITY}

