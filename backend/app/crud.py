from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Asset
from app.schemas import AssetCreate, AssetUpdate


def list_assets(db: Session) -> list[Asset]:
    statement = select(Asset).where(Asset.is_deleted.is_(False)).order_by(Asset.name)
    return list(db.scalars(statement))


def get_asset(db: Session, asset_id: str) -> Asset | None:
    return db.get(Asset, asset_id)


def create_asset(db: Session, asset: AssetCreate) -> Asset:
    data = asset.model_dump(mode="json")
    db_asset = get_asset(db, asset.id)

    if db_asset is not None:
        for key, value in data.items():
            setattr(db_asset, key, value)
        db_asset.is_deleted = False
        db_asset.version += 1
        db.commit()
        db.refresh(db_asset)
        return db_asset

    db_asset = Asset(**data)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


def update_asset(db: Session, asset_id: str, asset: AssetUpdate) -> Asset | None:
    db_asset = get_asset(db, asset_id)
    if db_asset is None or db_asset.is_deleted:
        return None

    for key, value in asset.model_dump(mode="json").items():
        setattr(db_asset, key, value)

    db_asset.version += 1
    db.commit()
    db.refresh(db_asset)
    return db_asset


def delete_asset(db: Session, asset_id: str) -> bool:
    db_asset = get_asset(db, asset_id)
    if db_asset is None or db_asset.is_deleted:
        return False

    db_asset.is_deleted = True
    db_asset.version += 1
    db.commit()
    return True
