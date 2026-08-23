export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = body.data;

    let prepare = db.prepare(
      "INSERT INTO places (id, longitude, latitude, name, pos) VALUES (?, ?, ?, ?, ?);",
    );
    let get = db.prepare("SELECT id FROM places;").all();

    prepare.run(
      data.id,
      data.longitude,
      data.latitude,
      data.name,
      get.length + 1,
    );

    return db.prepare("SELECT * FROM places ORDER BY pos").all();
  } catch (error) {
    console.log(error);
  }
});
