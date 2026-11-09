from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import AfterValidator, BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.validators import not_blank


class SendMessageIn(BaseModel):
    text: Annotated[str, Field(min_length=1, max_length=4000), AfterValidator(not_blank)]


class MessageOut(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

    id: UUID
    role: Literal["interviewer", "candidate"]
    text: str
    created_at: datetime
