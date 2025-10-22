import axios from "axios";

const API_URL = "https://localhost:7113/odata/JobTechnician/my-jobs";


const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZDJjNGM5ZS0xZDNjLTQ0ODUtYTNiNS05NjA1YTFkMTQ2MjkiLCJqdGkiOiJlMmYzZWZmNi1lMWQ0LTRmMTYtYjg3YS0yNTg3MTY2OThkZDQiLCJlbWFpbCI6IjA5MDAwMDAwMDdAbXlhcHAuY29tIiwibmFtZWlkIjoiN2QyYzRjOWUtMWQzYy00NDg1LWEzYjUtOTYwNWExZDE0NjI5IiwidW5pcXVlX25hbWUiOiIwOTAwMDAwMDA3IiwiRmlyc3ROYW1lIjoiRGVmYXVsdCIsIkxhc3ROYW1lIjoiVGVjaG5pY2lhbjEiLCJMYXN0TG9naW4iOiIxMC8yMS8yMDI1IDg6NDc6MTEgQU0iLCJyb2xlIjoiVGVjaG5pY2lhbiIsIm5iZiI6MTc2MTAzNjQzMSwiZXhwIjoxNzYxMDM4MjMxLCJpYXQiOjE3NjEwMzY0MzEsImlzcyI6Ik15QXV0aEFwcCIsImF1ZCI6Ik15QXV0aEFwcFVzZXJzIn0.SO3ea-csaWbzsM6cBG-k3iBr_ZQQZAnW4knidZ6-LQA"; // token JWT của bạn

export const getMyJobs = async (token?: string) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token || TEST_TOKEN}`, 
      },
    });
    return response.data.value || response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};
