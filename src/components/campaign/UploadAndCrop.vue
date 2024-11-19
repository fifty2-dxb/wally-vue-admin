<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <div class="w-100 position-relative" v-if="value">
        <img style="height: 60px" v-bind="props" :src="value" class="float-left" />
        <v-icon color="red" size="small" icon="tabler-trash" class="position-absolute top-0 right-0"
          @click="removeImage"></v-icon>
      </div>

      <div class="w-100 position-relative" v-else>
        <v-btn v-bind="props" class="w-100" size="small" color="primary" variant="outlined">
          {{ $t("Upload Image") }}
        </v-btn>
      </div>
    </template>

    <template v-slot:default>
      <v-card>
        <vue-picture-cropper :boxStyle="props.boxStyle" :img="pic" :options="props.options"
          :presetMode="props.presetMode" />
        <v-card-text>
          <v-file-input accepts="image/png" label="Select Image" prepend-icon="tabler-photo-up" background="transparent"
            @change="imageSelected"></v-file-input>
          <small v-if="fileError" class="text-error">{{ fileError }}</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancel">CANCEL</v-btn>
          <v-btn color="primary" @click="saveImage" :disabled="isSaveDisabled">SAVE IMAGE</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import VuePictureCropper, { cropper } from "vue-picture-cropper";

const props = defineProps(["modelValue", "options", "presetMode", "boxStyle", "outputOptions"]);
const emit = defineEmits(["update:modelValue"]);

const dialog = ref(false);
const fileError = ref("");
const pic = ref("");
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const isSaveDisabled = computed(() => {
  return !pic.value || fileError.value !== "";
});

// Handle image selection
const imageSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== "image/png") {
    fileError.value = "Only .PNG files are accepted.";
    pic.value = "";
    return;
  }
  if (file.size > 1 * 1024 * 1024) {
    fileError.value = "File size should not exceed 1 MB.";
    pic.value = "";
    return;
  }

  fileError.value = "";
  const reader = new FileReader();
  reader.onload = (event) => {
    pic.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const saveImage = async () => {
  if (!cropper) return;

  const file = await cropper.getFile({ fileName: "logoimage.png" });
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await $wallyApi("/photo", {
      method: "POST",
      body: formData,
    });
    const imageUrl = response.url;
    value.value = imageUrl;

    resetFields();
    dialog.value = false;
  } catch (error) {
    console.error("Error uploading image:", error);
    fileError.value = "Failed to upload the image. Please try again.";
  }
};

// Reset dialog fields
const resetFields = () => {
  pic.value = "";
  fileError.value = "";
};

// Cancel action
const cancel = () => {
  resetFields();
  dialog.value = false;
};

// Remove uploaded image
const removeImage = () => {
  value.value = null;
};
</script>
