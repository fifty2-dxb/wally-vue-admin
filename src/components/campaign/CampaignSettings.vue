<template>
  <v-card class="elevation-0" :title="$t('Apple configuration')">
    <v-card-text>
      <v-select label="Certificate" :items="['Wally Loyalty (pass.com.wally.loyalty)']" class="mb-6"></v-select>
      <v-text-field v-model="data.template.appleSettings.teamIdentifier" :label="$t('Team Identifier')"
        class="mb-6" disabled></v-text-field>
        
      <v-select label="webServiceURL" :items="['Wally (dev-api.wally.ae)', 'Custom API']" class="mb-6"></v-select>
      <v-checkbox v-model="data.template.appleSettings.sharingProhibited" label="sharingProhibited" class="mb-6"></v-checkbox>
    </v-card-text>
  </v-card>

  <v-divider></v-divider>

  <v-card class="elevation-0" :title="$t('Android configuration')">
    <v-card-text>
      <v-checkbox v-model="data.template.appleSettings.sharingProhibited" label="SmartTap Enabled" class="mb-6"></v-checkbox>
      <v-select label="Redemption Issuer" :items="['3388000000022313780']" class="mb-6"></v-select>

    </v-card-text>
  </v-card>


</template>

<script setup>
// get data from v-model
import { ref, watch, computed } from "vue";

const props = defineProps(["modelValue"]);
const emits = defineEmits(["update:modelValue"]);
const editModal = ref(false);
const locationModal = ref(false);
const newLocation = ref({
  name: "",
  address: "",
  display: true,
  message: "",
});

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
  data.value.template.details.locations.push(newLocation.value);
  locationModal.value = false;
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
</script>
