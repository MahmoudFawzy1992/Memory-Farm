import axios from "../utils/axiosInstance";

export const fetchProfile = async () => {
  const res = await axios.get("/user/me");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axios.put("/user/update", data);
  return res.data;
};

export const deleteUser = async () => {
  const res = await axios.delete("/user/delete");
  return res.data;
};
