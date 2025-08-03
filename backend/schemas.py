from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from enum import Enum


class AVAILABILITY_ENUM(str, Enum):
    NO = "NO"
    MAYBE = "MAYBE"
    YES = "YES"
    IDK = "IDK"

class MEMBER_BASE(BaseModel):
    MEMBER_NAME: str

class PROFILE(BaseModel):
    USER_ID: int
    MEMBER_NAME: str
    ADMIN: bool
    initials: str  # <-- add this line

    class Config:
        orm_mode = True
class MEMBER_CREATE(BaseModel):
    MEMBER_NAME: str
    PASSWORD: str


class MEMBER(BaseModel):
    USER_ID: int
    MEMBER_NAME: str
    ADMIN: bool


class SHOW_BASE(BaseModel):
    SHOW_ID: int
    SHOW_NAME: str
    SHOW_DESCRIPTION: Optional[str]
    SHOW_DATE: date
    SHOW_LOCATION: Optional[str]
    SHOW_TIME: Optional[time]
    YOUTUBE_LINK: Optional[str]
    IMAGE_URL: Optional[str]

class ShowUpdate(BaseModel):
    SHOW_NAME: Optional[str]
    SHOW_DESCRIPTION: Optional[str]
    SHOW_DATE: Optional[date]
    SHOW_TIME: Optional[time]
    SHOW_LOCATION: Optional[str]
    YOUTUBE_LINK: Optional[str]
    IMAGE_URL: Optional[str]


class SHOW_CREATE(SHOW_BASE):
    pass


class SHOW(SHOW_BASE):
    SHOW_ID: int

    class Config:
        orm_mode = True


class AVAILABLE_MEMBER_BASE(BaseModel):
    MEMBER_AVAILABILITY: AVAILABILITY_ENUM

class MemberAvailabilityResponse(BaseModel):
    USER_ID: int
    MEMBER_NAME: str
    MEMBER_AVAILABILITY: Optional[AVAILABILITY_ENUM]

    class Config:
        orm_mode = True

class AVAILABLE_MEMBER(AVAILABLE_MEMBER_BASE):
    class Config:
        orm_mode = True

class AvailabilityUpdate(BaseModel):
    USER_ID: int
    MEMBER_AVAILABILITY: AVAILABILITY_ENUM

class BLOG_POST_BASE(BaseModel):
    POST_TITLE: str
    POST_CONTENTS: str
    POST_AUTHOR: str
    POST_IMAGE: Optional[str] = None

class BLOG_POST_CREATE(BLOG_POST_BASE):
    POST_DATE: Optional[date] = None  # optional for create, defaults to current date

class BLOG_POST_RESPONSE(BLOG_POST_BASE):
    POST_ID: int
    POST_DATE: date

    class Config:
        orm_mode = True