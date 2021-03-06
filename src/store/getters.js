/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:36:28
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-29 15:48:34
 */

export default {
  token: state => state.user.token,
  uid: state => state.user.token,
  avatar: state => state.user.avatar,
  elderList: state => state.elder.elderList,
  serialInfo: state => state.elder.serialInfo,
  name: state => state.user.name,
  pwd: state => state.user.pwd,
  introduction: state => state.user.introduction,
  userInfo: state => state.user.userInfo,
  navbarMenus: state => state.menu.navbarMenus,
  sysMenuList: state => state.menu.sysMenuList,
  sidebarMenuList: state => state.menu.sidebarMenuList,
  houseMessage: state => state.message.houseMessage,
  sidebarCollapse: state => state.sidebarCollapse,
  documentClientHeight: state => state.documentClientHeight,
  houseList: state => state.houseList,
  house: state => state.house,
  houseId: state => state.houseId
}
