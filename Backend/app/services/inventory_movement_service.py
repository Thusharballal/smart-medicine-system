from app.database.connection import get_database
from app.models.inventory_movement_model import InventoryMovementModel


async def create_inventory_movement(
    movement: InventoryMovementModel,
):
    database = get_database()

    await database.inventory_movements.insert_one(
        movement.model_dump(),
      
    )