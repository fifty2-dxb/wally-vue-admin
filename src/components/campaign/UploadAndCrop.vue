<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <div class="w-100 position-relative" v-if="value">
        <img style="height: 60px" v-bind="props" :src="value" class="float-left" />

        <v-icon v-if="value" color="red" size="small" icon="tabler-trash"
          class="position-absolute top-0 right-0" @click="removeImage"></v-icon>
      </div>

      <div class="w-100 position-relative" v-else>
        <v-btn v-bind="props" class="w-100" size="small" color="primary" variant="outlined">
          {{ $t("Upload Image") }}
        </v-btn>
      </div>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <vue-picture-cropper
            :boxStyle="boxStyle"
            :img="pic"
            :options="options"
            :presetMode="presetMode"
          />
        <v-card-text>
          
          <v-file-input label="Select Image" prepend-icon="tabler-photo-up" background="transparent" @change="imageSelected"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  @click="cancel">CANCEL</v-btn>
          <v-btn color="primary" @click="saveImage">SAVE IMAGE</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

// Props and emits setup
const props = defineProps(["modelValue", "options", "presetMode", "boxStyle"]);
const emit = defineEmits(["update:modelValue"]);

const dialog = ref(false);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const pic = ref("");

// Image selection handler
const imageSelected = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    pic.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Save image and close the dialog
const saveImage = async () => {
  if (!cropper) return;
  
  const base64 = cropper.getDataURL();
  const blob: Blob | null = await cropper.getBlob();
  if (!blob) return;

  const file = await cropper.getFile({
    fileName: 'logoimage',
  });

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await $wallyApi('/photo', {
      method: 'POST',
      body: formData,
    });

    const imageUrl = response.url;
    value.value = imageUrl;
    dialog.value = false; // Close the dialog on save
    pic.value = ""; // Clear the image preview
    
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

// Cancel action
const cancel = () => {
  dialog.value = false; // Close the dialog on cancel
};

// Remove image and set value to null
const removeImage = () => {
  value.value = null;
};

</script>
