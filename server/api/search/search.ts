export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    return $fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${query.text}&limit=5&format=json&apiKey=${process.env.APIKEY}`,
    );
  } catch (error) {
    console.log(error);
  }
});
