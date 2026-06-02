from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import AssetCreate, AssetRead, AssetUpdate


router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[AssetRead])
def list_assets(db: Session = Depends(get_db)) -> list[AssetRead]:
    return crud.list_assets(db)


@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)) -> AssetRead:
    existing_asset = crud.get_asset(db, asset.id)
    if existing_asset and not existing_asset.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Asset with this ID already exists",
        )
    return crud.create_asset(db, asset)


@router.put("/{asset_id}", response_model=AssetRead)
def update_asset(
    asset_id: str,
    asset: AssetUpdate,
    db: Session = Depends(get_db),
) -> AssetRead:
    if asset.id != asset_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Path asset ID must match request body asset ID",
        )

    updated_asset = crud.update_asset(db, asset_id, asset)
    if updated_asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    return updated_asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: str, db: Session = Depends(get_db)) -> Response:
    deleted = crud.delete_asset(db, asset_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
