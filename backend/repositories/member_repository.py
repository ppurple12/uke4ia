from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sql_connector import get_db  
from schemas import MEMBER_BASE,PROFILE, MEMBER, MEMBER_CREATE
from models import MEMBERS

router = APIRouter()

@router.post("/users/login")
def login(req: MEMBER_CREATE,  db: Session = Depends(get_db)):
    user = db.query(MEMBERS).filter(MEMBERS.MEMBER_NAME == req.MEMBER_NAME).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    #if not bcrypt.checkpw(req.PASSWORD.encode('utf-8'), user.PASSWORD.encode('utf-8')):
    #    raise HTTPException(status_code=401, detail="Invalid email or password")

    
    return {
        "user_id": user.USER_ID,
        "is_admin": user.ADMIN  #
    }

@router.get("/profile/{user_id}", response_model=PROFILE)
async def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(MEMBERS).filter(MEMBERS.USER_ID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    name_parts = user.MEMBER_NAME.strip().split()
    initials = "".join(part[0].upper() for part in name_parts if part)
    user_dict = user.__dict__.copy()
    user_dict["initials"] = initials

    return user_dict

@router.get("/members", response_model=list[MEMBER])
def get_all_members( db: Session = Depends(get_db)):
    return db.query(MEMBERS).all()


@router.post("/members", response_model=MEMBER_BASE)
def add_member( payload: MEMBER_BASE, db: Session = Depends(get_db)):
    existing = db.query(MEMBERS).filter(MEMBERS.MEMBER_NAME == payload.MEMBER_NAME).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists.")

    new_member = MEMBERS(
        MEMBER_NAME= payload.MEMBER_NAME,
        PASSWORD= "Uke4ia",
        ADMIN=False,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@router.delete("/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(MEMBERS).filter(MEMBERS.USER_ID == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")
    db.delete(member)
    db.commit()
    return {"detail": "Member deleted"}


@router.post("/members/{member_id}/make_admin")
def make_admin(member_id: int, db: Session = Depends(get_db)):
    member = db.query(MEMBERS).filter(MEMBERS.USER_ID == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")
    member.ADMIN = True
    db.commit()
    return {"detail": "Admin privileges granted"}


@router.post("/members/{member_id}/remove_admin")
def remove_admin(member_id: int, db: Session = Depends(get_db)):
    member = db.query(MEMBERS).filter(MEMBERS.USER_ID == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")
    member.ADMIN = False
    db.commit()
    return {"detail": "Admin privileges removed"}