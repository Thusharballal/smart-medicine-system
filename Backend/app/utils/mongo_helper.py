from bson import ObjectId
def serialize_mongo(document: dict) -> dict:
    """
    Convert MongoDB ObjectId fields to strings
    so FastAPI can return JSON responses.
    MongoDB:
        _id: ObjectId("...")
    Application:
        id: "..."
    """
    if document is None:
        return None
    document = document.copy()
    if "_id" in document and isinstance(document["_id"], ObjectId):
        document["id"] = str(document["_id"])
        del document["_id"]
    return document