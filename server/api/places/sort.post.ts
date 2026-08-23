import { placeData } from "~~/server/utils/sqlite";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = body.data as placeData[];

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as placeData;
      db.prepare("UPDATE places SET pos = ? WHERE id = ?").run(
        item.pos,
        item.id,
      );
    }
    return;
  } catch (error) {
    console.log(error);
  }
});
