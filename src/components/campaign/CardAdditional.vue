<template>
  <v-card class="elevation-0" :title="$t('Additional Fields')"
    :subtitle="$t('Create your additional fields for your Digital Loyalty Card')">
    <v-card-text>
      <v-list lines="three" select-strategy="classic">
        <v-list-item @click="showEditModal(index)" v-for="(item, index) in data.template.additionalFields" :key="item">
          <template v-slot:prepend="{ isActive }">
            <v-list-item-action class="pt-2" start>
              <v-icon class="mr-3" size="24" icon="tabler-menu-2"></v-icon>
            </v-list-item-action>
          </template>

          <template v-slot:append="{ isActive }">
            <v-list-item-action class="pt-2" start>
              <v-icon class="mr-3" color="red" size="24" icon="mdi mdi-delete" @click="deleteField(index)"></v-icon>
            </v-list-item-action>
          </template>

          <v-list-item-title>{{ item.title }}</v-list-item-title>

          <v-list-item-subtitle>
            {{ item.description }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-btn text color="primary" variant="outlined" @click="addAdditionalField" class="ms-auto">
        <v-icon icon="tabler-plus" size="x-small" class="pe-2" left></v-icon>
        {{ $t("Add Additional Field") }}
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog v-model="editModal" width="500">
    <v-card :title="$t('Edit Field')">
      <v-card-text class="pa-3">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field name="input-7-1" variant="outlined" label="Title" auto-grow v-model="selectedField.title"
                class="mb-6"></v-text-field>
              <v-select v-model="selectedField.type" :items="fieldTypes" variant="outlined" label="Field types"
                item-title="name" item-value="key" class="mb-6"></v-select>
              <v-textarea name="input-7-1" variant="outlined" label="Details" auto-grow
                v-model="selectedField.description" class="mb-6"></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="editModal = false">{{ $t("Close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-divider class=""></v-divider>
  <v-card class="elevation-0" :title="$t('Card Details')">
    <v-card-text>
      <v-text-field v-model="data.template.details.cardDescription" :label="$t('Card Description')"
        class="mb-6"></v-text-field>
      <v-textarea v-model="data.template.details.howToEarn" :label="$t('How to customers earn 1 stamp')"
        bg-color="transparent" class="mb-6"></v-textarea>
      <v-text-field v-model="data.template.details.businessName" :label="$t('Business Name')"
        class="mb-6"></v-text-field>
    </v-card-text>
  </v-card>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Reward & Stamp Messages')">
    <v-card-text>
      <v-text-field v-model="data.template.details.rewardDetails" :label="$t('Reward Details')"
        class="mb-6"></v-text-field>
      <v-textarea v-model="data.template.details.description" :label="$t('Please describe the reward')"
        bg-color="transparent" class="mb-6"></v-textarea>
      <v-text-field v-model="data.template.details.stampSuccessMessage" :label="$t('Stamp Success Message')" :hint="$t(
        'You must include {#} in your stamp success message. {#} is a placeholder for the number of stamps.'
      )
        " class="mb-6"></v-text-field>

      <v-text-field v-model="data.template.details.rewardSuccessMessage" :label="$t('Reward Success Message')" :hint="$t(
        'You must include {#} in your stamp success message. {#} is a placeholder for the number of stamps.'
      )
        " class="mb-6"></v-text-field>
    </v-card-text>
  </v-card>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Locations')">
    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">{{ $t("Location") }}</th>
            <th class="text-left">{{ $t("Adress on Card") }}</th>
            <th class="text-left">{{ $t("Display") }}</th>
            <th class="text-left">{{ $t("Message") }}</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in data.template.details.locations" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.formattedAddress ? item.formattedAddress : item.address }}</td>
            <td>
              <v-switch v-model="item.display" color="primary" />
            </td>
            <td>
              <v-textarea v-model="item.message" rows="2" bg-color="transparent" placeholder="Enter message..." />
            </td>
            <td>
                    <v-icon size="24" icon="tabler-pencil" @click="editLocation(index)" ></v-icon>
                    </td>
            <td>
              <v-icon color="red" size="24" icon="tabler-trash" @click="deleteLocation(index)"></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <v-card-actions>
      <v-btn text color="primary" variant="outlined" @click="dialog = true; newLocation = {}" class="ms-auto">
        <v-icon icon="tabler-plus" size="x-small" class="pe-2" left></v-icon>
        {{ $t("Add Location") }}
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="dialog" max-width="1200">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ editMode ? $t("Edit Location") : $t("Add Location") }}</span>
      </v-card-title>
      <v-divider class="my-2" />
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="locationName" label="Location Name" class="mb-6"></v-text-field>
              <v-text-field v-model="address" label="Enter address" @input="onAddressInput"></v-text-field>
              
              <!-- Address Suggestions -->
              <v-list v-if="suggestions?.length">
                <v-list-item v-for="(suggestion, index) in suggestions" :key="index"
                  @click="selectSuggestion(suggestion)" class="suggestion-item">
                  {{ suggestion?.formatted_address }}
                </v-list-item>
              </v-list>

              <!-- Advanced Fields -->
              <v-card-actions class="advanced-btn-padding">
                <v-btn text color="primary" @click="toggleAdvancedFields" class="advanced-btn">
                  {{ advancedFieldsVisible ? "Hide Advanced" : "Show Advanced" }}
                  <v-icon icon="tabler-chevron-down" size="small"></v-icon>
                </v-btn>
              </v-card-actions>

              <v-expand-transition>
                <v-row v-if="advancedFieldsVisible">
                  <v-col cols="6">
                    <v-text-field v-model="latitude" label="Latitude" class="mb-6"></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="longitude" label="Longitude" class="mb-6"></v-text-field>
                  </v-col>
                </v-row>
              </v-expand-transition>

              <v-textarea v-model="formattedAddress" label="Address to display" class="mb-6"></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-responsive>
                <GoogleMap ref="googleMap" :api-key="googleApiKey" style="width: 100%; height: 300px;"
                  :center="center" :zoom="15" @click="updateLatLng">
                  <Marker :options="{ position: { lat: Number(latitude), lng: Number(longitude) } }" />
                </GoogleMap>
              </v-responsive>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider class="my-4" />
      <v-card-actions>
        <v-btn color="primary" @click="editMode ? updateLocation() : addLocation()">
          {{ editMode ? $t("Update Location") : $t("Add Location") }}
        </v-btn>
        <v-btn color="secondary" @click="closeDialog">{{ $t("Close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </v-card>

  <v-divider class=""></v-divider>

  <v-card class="elevation-0" :title="$t('Useful Links')">
    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">{{ $t("Text") }}</th>
            <th class="text-left">
              {{ $t("Link") }}
            </th>
            <th class="text-left">
              {{ $t("Type") }}
            </th>
            <th class="text-left"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in data.template.details
            .usefulLinks" :key="index">
            <td>
              <v-text-field v-model="item.text" outlined dense></v-text-field>
            </td>
            <td>
              <v-text-field v-model="item.link" outlined dense></v-text-field>
            </td>
            <td>
              <v-select v-model="item.type" :items="fieldTypes" item-title="name" item-value="key"
                bg-color="transparent" outlined dense></v-select>
            </td>
            <td class="text-end">
              <v-icon class="mr-3" color="red" size="24" icon="tabler-trash"
                @click="deleteUsefulLink(index)"></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <v-card-actions>
      <v-btn text color="primary" variant="outlined" @click="addUsefulLink" class="ms-auto">
        <v-icon icon="tabler-plus" size="x-small" class="pe-2" left></v-icon>
        {{ $t("Add Useful Link") }}
      </v-btn>
    </v-card-actions>
  </v-card>


</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { GoogleMap, Marker } from 'vue3-google-map'
import axios from 'axios';

const props = defineProps(["modelValue"]);
const emits = defineEmits(["update:modelValue"]);
const editModal = ref(false);
const dialog = ref(false);
const locationName = ref('');
const address = ref('');
const formattedAddress = ref('');
const center = reactive({ lat: 25.1972295, lng: 55.279747 });
const suggestions = ref([]);
const latitude = ref(center.lat);
const longitude = ref(center.lng);
const googleMap = ref(null);
const advancedFieldsVisible = ref(false);
const googleApiKey = import.meta.env.VITE_APP_WALLY_GOOGLE_KEY
const editMode = ref(false);
let selectedLocationIndex = ref(null); 


let debounceTimeout = null;
let marker = null;

const toggleAdvancedFields = () => {
  advancedFieldsVisible.value = !advancedFieldsVisible.value;
};

const updateLatLng = (e) => {
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();

  latitude.value = lat;
  longitude.value = lng;

  center.lat = lat;
  center.lng = lng;

  updateMarkerPosition(lat, lng);
};

const createMarker = (map, lat, lng) => {
  if (!marker) {
    marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
    });
  }
};

const updateMarkerPosition = (lat, lng) => {
  if (marker) {
    marker.setPosition({ lat, lng });
  }
};

watch([latitude, longitude], ([newLat, newLng]) => {
  const lat = parseFloat(newLat);
  const lng = parseFloat(newLng);

  if (isFinite(lat) && isFinite(lng)) {
    center.lat = lat;
    center.lng = lng;

    if (googleMap.value && googleMap.value.map) {
      const map = googleMap.value.map;

      createMarker(map, lat, lng);
      updateMarkerPosition(lat, lng);

      map.setCenter({ lat, lng });
      map.panTo({ lat, lng });
    }
  } else {
    console.warn('Invalid latitude or longitude input.');
  }
});

const onAddressInput = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  debounceTimeout = setTimeout(async () => {
    if (address.value.length > 2) {
      await fetchAddressSuggestions(address.value);
    } else {
      suggestions.value = [];
    }
  }, 300);
};

const fetchAddressSuggestions = async (query) => {
  try {
    const apiKey = googleApiKey
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
    );
    suggestions.value = response.data.results;
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    suggestions.value = [];
  }
};

const selectSuggestion = (suggestion) => {
  address.value = suggestion.formatted_address;
  latitude.value = suggestion.geometry.location.lat;
  longitude.value = suggestion.geometry.location.lng;

  center.lat = latitude.value;
  center.lng = longitude.value;

  suggestions.value = [];
};

const fieldTypes = ref([
  { name: "Text", key: "text" },
  { name: "Phone", key: "phone" },
  { name: "Email", key: "email" },
  { name: "URL", key: "url" },
]);

const data = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const resetLocationFields = () => {
  locationName.value = '';
  address.value = '';
  latitude.value = center.lat;
  longitude.value = center.lng;
  formattedAddress.value = '';
};

const addAdditionalField = () => {
  data.value.template.additionalFields.push({
    title: "FieldTitle",
    description: "Add some description",
    type: "Text",
  });
};

const addUsefulLink = () => {
  data.value.template.details.usefulLinks.push({
    text: "Link Text",
    link: "https://",
    type: "text",
  });
};

const deleteUsefulLink = (index) => {
  data.value.template.details.usefulLinks.splice(index, 1);
};

const addLocation = () => {
  data.value.template.details.locations.push({
    name: locationName.value,
    address: formattedAddress.value || address.value,
    latitude: latitude.value,
    longitude: longitude.value,
    display: true,
    message: ''
  });
  resetLocationFields();
  dialog.value = false;
};
const editLocation = (index) => {
  const location = data.value.template.details.locations[index];
  
  locationName.value = location.name;
  address.value = location.address;
  formattedAddress.value = location.formattedAddress;
  latitude.value = location.latitude;
  longitude.value = location.longitude;

  center.lat = latitude.value;
  center.lng = longitude.value;

  selectedLocationIndex.value = index;
  editMode.value = true;
  dialog.value = true;
};

const updateLocation = () => {
  if (selectedLocationIndex.value !== null) {
    const location = data.value.template.details.locations[selectedLocationIndex.value];

    location.name = locationName.value;
    location.address = address.value;
    location.formattedAddress = formattedAddress.value;
    location.latitude = latitude.value;
    location.longitude = longitude.value;

    resetLocationFields();
    dialog.value = false;
    editMode.value = false;
  }
};

const deleteLocation = (index) => {
  data.value.template.details.locations.splice(index, 1);
};

const selectedField = ref({});
const showEditModal = (index) => {
  editModal.value = true;
  selectedField.value = data.value.template.additionalFields[index];
};

const deleteField = (index) => {
  data.value.template.additionalFields.value.splice(index, 1);
};

const closeDialog = () => {
  resetLocationFields();
  dialog.value = false;
  editMode.value = false;
};

</script>

<style lang="scss" scoped>
.pac-container {
  z-index: 10000 !important;
}
.v-list-item {
  cursor: pointer;
}
.advanced-btn-padding {
  padding: 12px 0 12px;
}
.advanced-btn{
  padding-inline: 2.5px;
}
</style>
