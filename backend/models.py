from sqlalchemy import Column, Integer, String, Boolean, Date, Enum, ForeignKey, Text, Time
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class AVAILABILITY_ENUM(str, enum.Enum):
    NO = "NO"
    MAYBE = "MAYBE"
    YES = "YES"
    IDK = "IDK"


class MEMBERS(Base):
    __tablename__ = "MEMBERS"

    USER_ID = Column(Integer, primary_key=True, index=True)
    MEMBER_NAME = Column(String(120), nullable=False)
    PASSWORD = Column(String(255), nullable=False)
    ADMIN = Column(Boolean, default=False)

    AVAILABILITY = relationship("AVAILABLE_MEMBERS", back_populates="MEMBER")


class SHOWS(Base):
    __tablename__ = "SHOWS"

    SHOW_ID = Column(Integer, primary_key=True, autoincrement=True)
    SHOW_NAME = Column(String(255), nullable=False)
    SHOW_DESCRIPTION = Column(Text)
    SHOW_DATE = Column(Date, nullable=False)
    SHOW_LOCATION = Column(String(255))
    SHOW_TIME = Column(Time)
    YOUTUBE_LINK = Column(String(255))
    IMAGE_URL = Column(String(255))

    AVAILABILITY = relationship("AVAILABLE_MEMBERS", back_populates="SHOW")


class AVAILABLE_MEMBERS(Base):
    __tablename__ = "AVAILABLE_MEMBERS"

    SHOW_ID = Column(Integer, ForeignKey("SHOWS.SHOW_ID"), primary_key=True)
    USER_ID = Column(Integer, ForeignKey("MEMBERS.USER_ID"), primary_key=True)
    MEMBER_AVAILABILITY = Column(Enum(AVAILABILITY_ENUM), nullable=False)

    MEMBER = relationship("MEMBERS", back_populates="AVAILABILITY")
    SHOW = relationship("SHOWS", back_populates="AVAILABILITY")

class BLOG_POST(Base):
    __tablename__ = "BLOG_POST"

    POST_ID = Column("POST_ID", Integer, primary_key=True, index=True)
    POST_TITLE = Column("POST_TITLE", String(255), nullable=False)
    POST_DATE = Column("POST_DATE", Date, nullable=False)
    POST_CONTENTS = Column("POST_CONTENTS", Text, nullable=False)
    POST_IMAGE = Column("POST_IMAGE", String(255), nullable=True)
    POST_AUTHOR = Column("POST_AUTHOR", String(100), ForeignKey("MEMBERS.MEMBER_NAME"), nullable=False)
