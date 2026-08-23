import { placeData } from "~~/server/utils/sqlite";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = body.data as placeData;

    let all = db
      .prepare("SELECT * FROM places ORDER BY pos")
      .all() as any as Array<placeData>;

    if (all.length === 0) return;

    let lastPos = (all[all.length - 1] as any as placeData).pos;

    if (data.pos === lastPos) {
      db.prepare("DELETE FROM places WHERE id = ?").run(data.id);
    } else if (data.pos === 1) {
      // first item in list - delete then decrement the others by 1??
      db.prepare("DELETE FROM places WHERE id = ?").run(data.id);
      let filtered = all.filter((x) => x.id !== data.id);
      for (let i = 0; i < filtered.length; i++) {
        db.prepare("UPDATE places SET pos = ? WHERE id = ?").run(
          (filtered[i] as placeData).pos - 1,
          (filtered[i] as placeData).id,
        );
      }
    } else {
      // its somewhere in the middle - delete then decrement the higher ones by 1??
      db.prepare("DELETE FROM places WHERE id = ?").run(data.id);
      let filtered = all
        .filter((x) => x.id !== data.id)
        .filter((x) => x.pos > data.pos);
      for (let i = 0; i < filtered.length; i++) {
        db.prepare("UPDATE places SET pos = ? WHERE id = ?").run(
          (filtered[i] as placeData).pos - 1,
          (filtered[i] as placeData).id,
        );
      }
    }

    return db
      .prepare("SELECT * FROM places ORDER BY pos")
      .all() as any as Array<placeData>;
  } catch (error) {
    console.log(error);
  }
});
