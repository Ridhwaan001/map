export default defineEventHandler(async (event) => {
  try {
    return db.prepare("SELECT * FROM PLACES ORDER BY pos").all();
  } catch (error) {
    console.log(error);
  }
});
