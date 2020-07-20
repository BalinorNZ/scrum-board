import { Actor } from "./JiraInterfaces";

export const getAvatar = (assignee?: Actor) => {
  if(!assignee || !assignee.avatarUrls) return undefined;
  if(assignee.avatarUrls["48x48"]) return assignee.avatarUrls["48x48"];
  if(assignee.avatarUrls["32x32"]) return assignee.avatarUrls["32x32"];
  if(assignee.avatarUrls["24x24"]) return assignee.avatarUrls["24x24"];
  if(assignee.avatarUrls["16x16"]) return assignee.avatarUrls["16x16"];
  return undefined;
}
