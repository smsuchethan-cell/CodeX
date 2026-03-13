from pydantic import BaseModel

class Hotspot(BaseModel):
    ward_name: str
    ward_id: int
    cluster_id: int