#define the database models

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    # hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    timezone = Column(String, default="America/New_York")

    daily_logs = relationship("DailyLog", back_populates="user")
    

class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(Integer, primary_key=True, index=True) #id of this log
    user_id = Column(Integer, ForeignKey("users.id"))
    log_date = Column(Date, server_default=func.current_date(), nullable=False) # YYYY-MM-DD
    checkin_time = Column(DateTime(timezone=True), server_default=func.now()) # YYYY-MM-DD HH:MM:SS+TZ. Let the DB handle it.
    checkout_time = Column(DateTime(timezone=True), nullable=True) # should not have a default value. only set when user checks out.
    in_attention = Column(String, nullable=True)
    in_obsession = Column(String, nullable=True)
    in_agency = Column(String, nullable=True)
    out_til1 = Column(String, nullable=True)
    out_til2 = Column(String, nullable=True)
    out_til3 = Column(String, nullable=True)
    reading = Column(String, nullable=True)
    link_dumps = Column(JSONB, default=lambda: [])

    __table_args__ = (
        UniqueConstraint('user_id', 'log_date', name='_user_log_date_uc'),
    )

    user = relationship("User", back_populates="daily_logs")


