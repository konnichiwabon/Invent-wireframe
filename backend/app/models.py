from sqlalchemy import Boolean, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    initials: Mapped[str] = mapped_column(String(16), nullable=False, default="")
    department: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    omadaUsername: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    avatarColor: Mapped[str] = mapped_column(String(32), nullable=False, default="#64748b")
    dateAsOf: Mapped[str] = mapped_column(String(32), nullable=False, default="")

    cpu: Mapped[dict] = mapped_column(JSON, nullable=False)
    ram: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    gpu: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    storage: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    network: Mapped[dict] = mapped_column(JSON, nullable=False)
    peripherals: Mapped[dict] = mapped_column(JSON, nullable=False)
    system: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Reserved for future soft-delete support.
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
