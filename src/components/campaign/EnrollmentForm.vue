<template>
  <v-card class="elevation-0">
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <div class="text-h5 text-center font-weight-bold">
            {{ $t("Enrollment Form") }}
          </div>
          <div class="text-subtitle-2 text-center">
            {{
              $t(
                "Create your enrollment form to get more information about your clients"
              )
            }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="elevation-0 mb-4">
    <v-list lines="three" select-strategy="classic">
      <v-divider></v-divider>
      <v-list-item
        @click="showEditModal(index)"
        v-for="(item, index) in data.template.enrollmentForm.fields"
        :key="item"
      >
        <template v-slot:prepend="{}">
          <v-list-item-action class="pt-2" start>
            <v-icon class="mr-3" size="24">fas fa-bars</v-icon>
          </v-list-item-action>
        </template>

        <template v-slot:append="{}">
          <v-list-item-action class="pt-2" start>
            <v-icon
              class="mr-3"
              color="red"
              size="24"
              @click="deleteField(index)"
              icon="mdi-trash-can-outline"
            ></v-icon>
          </v-list-item-action>
        </template>

        <v-list-item-title
          >{{ item.title }}
          <v-icon v-if="item.required" class="mr-3" size="8" color="red"
            >fas fa-asterisk</v-icon
          >
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <v-card-actions>
      <v-btn
        text
        color="primary"
        variant="outlined"
        class="ms-auto"
        @click="addEnrollmentForm"
      >
        <v-icon icon="fas fa-plus" size="x-small" class="pe-2" left></v-icon>
        {{ $t("Add Enrollment Field") }}
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-divider class="border-opacity-50"></v-divider>

  <v-card class="elevation-0 mt-2">
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <div class="text-h5 text-center font-weight-bold">
            {{ $t("Link to the user agreement") }}
          </div>
          <div class="text-subtitle-2 text-center">
            {{
              $t(
                "Place a link to the conditions that users will have to accept in order to complete the questionnaire"
              )
            }}
          </div>
        </v-col>
        <v-col cols="12">
          <v-radio-group>
            <v-radio label="Standard page" value="one"></v-radio>
            <v-radio label="User your own text and page" value="two"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-divider class="border-opacity-50"></v-divider>
  <v-card class="elevation-0 mt-2">
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <div class="text-h5 text-center font-weight-bold">
            {{ $t("Agreement to marketing mailing") }}
          </div>
        </v-col>
        <v-col cols="12">
          <v-switch
            v-model="emailMarketing"
            hide-details
            inset
            class="x-small"
            :label="$t('Agreement to marketing mailing')"
          ></v-switch>
          <v-switch
            v-model="smsMarketing"
            hide-details
            inset
            :label="$t('Agreement to receive Email mailing')"
          ></v-switch>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-dialog v-model="editModal" width="500">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t("Edit Field") }}</span>
      </v-card-title>
      <v-card-text class="pa-3">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                name="input-7-1"
                variant="outlined"
                label="Title"
                auto-grow
                v-model="selectedField.title"
              ></v-text-field>
              <v-select
                label="Field Type"
                :items="fieldTypes"
                item-title="title"
                item-value="key"
                v-model="selectedField.type"
              >
              </v-select>
              <v-checkbox
                v-model="selectedField.required"
                label="Required"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="editModal = false">{{
          $t("Close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
// get data from v-model
import { ref, watch, computed, onMounted } from "vue";

const props = defineProps(["modelValue"]);
const emits = defineEmits(["update:modelValue"]);
const editModal = ref(false);
const data = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const fieldTypes = ref([
  { key: "text", title: "Text" },
  { key: "number", title: "Number" },
  { key: "email", title: "Email" },
  { key: "date", title: "Date" },
  { key: "password", title: "Password" },
]);

onMounted(() => {
  data.value.template.enrollmentForm.fields = [
    { title: "Name", required: true, type: "text" },
    { title: "Surname", required: true, type: "text" },
    { title: "Phonenumber", required: true, type: "text" },
    { title: "Email", required: true, type: "text" },
  ];

});

const addEnrollmentForm = () => {
  data.value.template.enrollmentForm.fields.push({
    title: "FieldTitle",
    require: false,
    type: "text",
  });
};

const selectedField = ref({});
const showEditModal = (index) => {
  editModal.value = true;
  selectedField.value = data.value.template.enrollmentForm.fields[index];
};

const deleteField = (index) => {
  data.value.template.enrollmentForm.fields.splice(index, 1);
};
</script>
