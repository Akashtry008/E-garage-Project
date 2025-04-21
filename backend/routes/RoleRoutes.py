from fastapi import APIRouter
from models.RoleModel import Role,RoleOut
from controllers.RoleController import getAllRoles, addRole , deleteRole, getRoleById

router = APIRouter(tags=["Roles"], prefix="/roles")

@router.get("/")
async def get_roles():
    return await getAllRoles() #promise
#{name:"",descr:""}

@router.post("/")
async def post_role(role:Role):
    return await addRole(role)


@router.delete("/{roleId}")
async def delete_role(roleId:str):
    return await deleteRole(roleId)

@router.get("/{roleId}")
async def get_role_byid(roleId:str):
    return await getRoleById(roleId)