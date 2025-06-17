from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

# ==================================
# Schemas for the User resource
# ==================================

class UserBase(BaseModel):
    """Fields that are common to both creating and reading a user."""
    email: str
    name: Optional[str] = None
    timezone: Optional[str] = "America/New_York"

class UserCreate(UserBase):
    """For creating a user. Client provides this."""
    pass 


class UserUpdate(BaseModel):
    """For updating a user. All fields are optional."""
    name: Optional[str] = None
    timezone: Optional[str] = None

class UserRead(UserBase):
    """Schema for reading/returning a user. Sent from server to client."""
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }



# ==================================
# Schemas for the DailyLog resource
# ==================================
class DailyLogCreate(BaseModel):
    """
    Schema for the initial check-in (POST request).
    Contains only the fields a user provides in the morning.
    """
    log_date: date
    in_attention: Optional[str] = None # optional in case user is just recording the checkout that day(create log by checkout only)
    in_obsession: Optional[str] = None
    in_agency: Optional[str] = None
    reading: Optional[str] = None
    link_dumps: Optional[List[dict]] = []

class DailyLogCheckout(BaseModel):
    """
    Schema for the checkout or any edit (PATCH request).
    All fields are optional, as the user might only be updating one thing.
    """
    out_til1: str # at least one TIL is required
    out_til2: Optional[str] = None
    out_til3: Optional[str] = None
    reading: Optional[str] = None # Shared field
    link_dumps: Optional[List[dict]] = None # Shared field


class DailyLogUpdate(BaseModel):
    """
    Schema for the update (PATCH request).
    All fields are optional, as the user might only be updating one thing.
    """
    in_attention: Optional[str] = None
    in_obsession: Optional[str] = None
    in_agency: Optional[str] = None
    out_til1: Optional[str] = None
    out_til2: Optional[str] = None
    out_til3: Optional[str] = None
    reading: Optional[str] = None
    link_dumps: Optional[List[dict]] = None

# --- Schema for SERVER OUTPUT ---

class DailyLogRead(BaseModel):
    """
    The "receipt". This is the full, public representation of a log,
    sent from the server back to the client. It has everything.
    """
    id: int
    user_id: int
    log_date: date
    checkin_time: datetime
    checkout_time: Optional[datetime] = None
    in_attention: Optional[str] = None
    in_obsession: Optional[str] = None
    in_agency: Optional[str] = None
    out_til1: Optional[str] = None
    out_til2: Optional[str] = None
    out_til3: Optional[str] = None
    reading: Optional[str] = None
    link_dumps: List[dict]

    model_config = {"from_attributes": True}


class UserCreateWithLog(BaseModel):
    """For creating a user with a daily log already filled in."""
    user_data : UserCreate
    log_data : DailyLogCreate