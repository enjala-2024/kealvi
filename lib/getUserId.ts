/*export function getUserId() {
  let id = localStorage.getItem("user_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("user_id", id);
  }

  return id;
}*/
export function getUserId() {
  if (typeof window === "undefined") {
    return "";
  }

  let id = localStorage.getItem("user_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("user_id", id);
  }

  return id;
}