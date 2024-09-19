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
            <th class="text-left">
              {{ $t("Adress on Card") }}
            </th>
            <th class="text-left">{{ $t("Display") }}</th>
            <th class="text-left">{{ $t("Message") }}</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data.template.details.locations" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.address }}</td>
            <td>
              <v-switch v-model="item.display" color="primary" class="text-left"></v-switch>
            </td>
            <td>
              <v-textarea v-model="item.message" class="text-left mt-3" bg-color="transparent" rows="2"></v-textarea>
            </td>
            <td>
              <v-icon class="mr-3" color="red" size="24" icon="mdi mdi-delete" @click="deleteLocation(index)"></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <v-card-actions>
      <v-btn text color="primary" variant="outlined" @click="
        locationModal = true;
      newLocation = {};
      " class="ms-auto">
        <v-icon icon="tabler-plus" size="x-small" class="pe-2" left></v-icon>
        {{ $t("Add Location") }}
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="locationModal" width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ $t("Add Location") }}</span>
        </v-card-title>
        <v-card-text class="pa-3">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field name="input-7-1" variant="outlined" label="Location Name" auto-grow
                  v-model="newLocation.name"></v-text-field>
                <v-text-field name="input-7-1" variant="outlined" label="Address" auto-grow
                  v-model="newLocation.address"></v-text-field>
                <v-textarea name="input-7-1" variant="outlined" label="Message" auto-grow
                  v-model="newLocation.message"></v-textarea>

                <v-row>
                  <v-col cols="12">
                    <v-switch v-model="newLocation.display" color="primary" label="Display on Card"></v-switch>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="locationModal = false">
            {{ $t("Close") }}
          </v-btn>

          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="addLocation()">
            {{ $t("Add Location") }}
          </v-btn>
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
              <v-icon class="mr-3" color="red" size="24" icon="mdi mdi-delete"
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
