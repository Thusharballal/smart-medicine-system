from bson import ObjectId


def serialize_mongo(document: dict) -> dict:
    """
    Convert MongoDB ObjectId fields to strings
    so FastAPI can return JSON responses.
    """

    if document is None:
        return None

    document = document.copy()

    if "_id" in document and isinstance(document["_id"], ObjectId):
        document["_id"] = str(document["_id"])

    return document