<template>
  <LMap class="map" :zoom="zoom" :center="centre" :use-global-leaflet="false">
    <LTileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      layer-type="base"
      name="OpenStreetMap" />
    <LMarker
      :lat-lng="[item.latitude, item.longitude]"
      v-for="item in existingPlaces">
      <LPopup> {{ item.pos }}. {{ item.name }} </LPopup>
    </LMarker>
    <template v-for="(item, i) in existingPlaces">
      <LPolyline
        v-if="i !== existingPlaces.length - 1"
        :lat-lngs="[
          [item.latitude, item.longitude],
          [
            (existingPlaces[i + 1] as placeData).latitude,
            (existingPlaces[i + 1] as placeData).longitude,
          ],
        ]" />
    </template>
  </LMap>

  <div class="box" v-show="showWindow">
    <UCard class="boxContent">
      <template #header
        ><UButton icon="lucide:x" @click="toggleDisplay"
      /></template>

      <h1>Add a location</h1>
      <br />
      <UFormField label="Search">
        <UInput placeholder="Search here..." v-model="searchField" />
        &nbsp;
        <UButton @click="getLocations">Search</UButton>
      </UFormField>

      <br />
      <br />

      <div class="results">
        <template v-for="item in addLocationAutofill">
          <UCard>
            <h3>{{ item.name }}</h3>
            {{ item.street }}
            <br />
            {{ item.district }}
            <br />
            {{ item.city }}
            <br />
            {{ item.postcode }}
            <br />
            {{ item.state }}
            <br />
            <br />
            <UButton @click="addLocation(item)">Add</UButton> &nbsp;
            <UButton color="neutral" @click="showPlace(item)">Show</UButton>
          </UCard>
          <br />
        </template>
      </div>

      <template #footer>
        <div class="scroll">
          <template v-for="(item, len) in existingPlaces">
            <UCard>
              {{ item.pos }}. {{ item.name }}
              <br />
              <br />
              <span v-show="len !== 0">
                <UButton @click="moveItem(item, -1)" icon="lucide:arrow-up" />
                &nbsp;
              </span>
              <span v-show="len !== existingPlaces.length - 1">
                <UButton @click="moveItem(item, 1)" icon="lucide:arrow-down" />
                &nbsp;
              </span>
              <UButton
                color="neutral"
                icon="lucide:eye"
                @click="showCurrentPosition(item)" />
              &nbsp;
              <UButton
                color="error"
                icon="lucide:x"
                @click="deletePlace(item)" />
            </UCard>
            <br />
          </template>
        </div>
      </template>
    </UCard>
  </div>

  <div class="box" v-show="!showWindow">
    <UButton @click="navigateTo(`/`)" icon="lucide:house" />
    &nbsp;
    <UButton @click="toggleDisplay" icon="lucide:plus" />
  </div>
</template>

<script setup lang="ts">
const toast = useToast();

const zoom = ref<number>(14);
const centre = ref<[number, number]>([53.4066961, -3.0004969]);

const searchField = ref<string>("");
const addLocationAutofill = ref<Array<any>>([]);

const existingPlaces = ref<Array<placeData>>([]);

existingPlaces.value = await $fetch("/api/places/get");

let copyToDoMathsIdk = existingPlaces.value;

if (copyToDoMathsIdk.length !== 0) {
  let lat = 0;
  let lon = 0;
  for (let i = 0; i < copyToDoMathsIdk.length; i++) {
    const item = copyToDoMathsIdk[i];
    lat = lat + (item as placeData).latitude;
    lon = lon + (item as placeData).longitude;
  }
  lat = lat / copyToDoMathsIdk.length;
  lon = lon / copyToDoMathsIdk.length;

  centre.value = [lat, lon];
  await refreshNuxtData("centre");
}

const showWindow = ref<boolean>(false);
// https://www.geoapify.com/places-api/ (3000 free credits daily omg)

async function getLocations() {
  // let aa = await $fetch(
  //   `https://api.geoapify.com/v1/geocode/autocomplete?text=${searchField.value}&limit=5&format=json&apiKey=95eb12e4b793485bb534f5ec60a8686a`,
  // );
  let aa = await $fetch(
    `/api/search/search?text=${encodeURIComponent(searchField.value)}`,
  );
  const data = aa as any;
  addLocationAutofill.value = data.results;
  await refreshNuxtData("addLocationAutofill");
}

async function addLocation(location: any) {
  let id = location.place_id;

  let longitude = location.lon;
  let latitude = location.lat;
  let name = location.name;
  let pos = 0;

  let data: placeData = {
    id: id,
    name: name,
    longitude: longitude,
    latitude: latitude,
    pos: pos,
  };

  existingPlaces.value = await $fetch(`/api/places/add`, {
    method: "post",
    body: {
      data: data,
    },
  });

  searchField.value = "";
  addLocationAutofill.value = [];

  await refreshNuxtData([
    "existingPlaces",
    "searchField",
    "addLocationAutofill",
  ]);

  toast.add({
    title: "Added location",
    description: `${name} has been added to the list`,
  });
}

async function toggleDisplay() {
  showWindow.value = !showWindow.value;
  await refreshNuxtData("showWindow");
}

async function showPlace(location: any) {
  let longitude = location.lon;
  let latitude = location.lat;
  let name = location.name;

  centre.value = [latitude, longitude];
  zoom.value = 16;

  await refreshNuxtData(["centre", "zoom"]);
}

async function showCurrentPosition(location: placeData) {
  let longitude = location.longitude;
  let latitude = location.latitude;

  centre.value = [latitude, longitude];
  zoom.value = 16;

  await refreshNuxtData(["centre", "zoom"]);
}

async function moveItem(place: placeData, offset: number) {
  let copy = existingPlaces.value as Array<any>; // a - b
  copy.sort((a, b) => {
    return a.pos - b.pos;
  });

  let index = copy.findIndex((x) => {
    return x.pos === place.pos;
  });

  copy[index].pos = (copy[index] as placeData).pos + offset;
  copy[index + offset].pos = (copy[index + offset] as placeData).pos - offset;

  copy.sort((a, b) => {
    return a.pos - b.pos;
  });

  existingPlaces.value = copy;

  toast.add({
    title: "Position updated",
    description: `${place.name} has been moved to position ${
      copy.filter((x) => {
        return x.id === place.id;
      })[0].pos
    }`,
  });

  await refreshNuxtData("existingPlaces");
  await $fetch(`/api/places/sort`, {
    method: "post",
    body: {
      data: copy,
    },
  });
}

async function deletePlace(place: placeData) {
  existingPlaces.value = await $fetch(`/api/places/delete`, {
    method: "post",
    body: {
      data: place,
    },
  });

  await refreshNuxtData("existingPlaces");
  toast.add({
    title: "Place deleted",
    description: `${place.name} has been removed from the list`,
    color: "error",
  });
}

interface placeData {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  pos: number;
}
</script>

<style lang="css" scoped>
.map {
  height: 100vh;
  width: 100vw;
  position: fixed;
}

.box {
  position: fixed;
  bottom: 0px;
  width: fit-content;
  padding: 1rem;
}

.boxContent {
  bottom: 0px;
  width: fit-content;
  background-color: #ffffffaa;
  backdrop-filter: blur(5px);
}

h1 {
  font-size: 150%;
  font-weight: 900;
}

h3 {
  font-size: 110%;
  font-weight: 700;
}

.results {
  max-height: 20vh;
  overflow: scroll;
}

.scroll {
  max-height: 40vh;
  overflow: scroll;
}
</style>
