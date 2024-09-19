<template>
    <div class="w-100">
        <v-card class="py-3" :class="data.template.enrollmentForm.design.backgroundColor">
            <v-card-text>
                <div class="w-100 text-center pb-3">
                    <v-img
                        :src="data.template.properties.logo"
                        :height="60"
                        class="text-center"
                    />
                    <h3>{{ data.template.enrollmentForm.title }}</h3>
                </div>

                <div v-for="field in data.template.enrollmentForm.fields">
                    <v-text-field
                        :label="field.title"
                        :type="field.type"
                        :variant="
                            data.template.enrollmentForm.design.inputVariant
                        "
                        :density="data.template.enrollmentForm.design.density"
                        :class="data.template.enrollmentForm.design.textColor"
                    ></v-text-field>
                </div>
                <v-btn
                    block
                    class="mt-3"
                    :color="data.template.enrollmentForm.design.buttonColor"
                    :variant="data.template.enrollmentForm.design.buttonVariant"
                    >Submit</v-btn
                >
            </v-card-text>
        </v-card>

        <v-card class="mt-4 mb-3">
            <v-card-title class="text-center mb-3"> Form Design </v-card-title>
            <v-card-text>
                <v-text-field
                    :label="$t('Enrollment Form Title')"
                    variant="outlined"
                    outlined
                    v-model="data.template.enrollmentForm.title"
                ></v-text-field>
                <v-row>
                    <v-col>
                        <v-select
                            label="Field Type"
                            :items="inputVariants"
                            v-model="
                                data.template.enrollmentForm.design.inputVariant
                            "
                            item-title="title"
                            item-value="key"
                            variant="outlined"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            label="Density"
                            :items="densityList"
                            v-model="
                                data.template.enrollmentForm.design.density
                            "
                            item-title="title"
                            item-value="key"
                            variant="outlined"
                        ></v-select>
                    </v-col>
                </v-row>

                <v-autocomplete
                    label="Page Background Color"
                    :items="backgroundColors"
                    v-model="
                        data.template.enrollmentForm.design.pageBackgroundColor
                    "
                    variant="outlined"
                >
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :class="item?.raw"
                        ></v-list-item>
                    </template>
                </v-autocomplete>
                <v-autocomplete
                    label="Form Background Color"
                    :items="backgroundColors"
                    v-model="
                        data.template.enrollmentForm.design.backgroundColor
                    "
                    variant="outlined"
                >
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :class="item?.raw"
                        ></v-list-item>
                    </template>
                </v-autocomplete>
                <v-autocomplete
                    label="Field Color"
                    :items="textColors"
                    v-model="data.template.enrollmentForm.design.textColor"
                    variant="outlined"
                >
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :class="item?.raw"
                        ></v-list-item>
                    </template>
                </v-autocomplete>

                <v-row>
                    <v-col>
                        <v-select
                            label="Button Type"
                            :items="buttonVariants"
                            v-model="
                                data.template.enrollmentForm.design
                                    .buttonVariant
                            "
                            item-title="title"
                            item-value="key"
                            variant="outlined"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-autocomplete
                            label="Button Color"
                            :items="baseColors"
                            v-model="
                                data.template.enrollmentForm.design.buttonColor
                            "
                            variant="outlined"
                        >
                            <template v-slot:item="{ props, item }">
                                <v-list-item
                                    v-bind="props"
                                    :class="'bg-' + item?.raw"
                                ></v-list-item>
                            </template>
                        </v-autocomplete>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup>
import { ref } from "vue";
import TemplateService from "@/services/TemplateService";

defineProps({
    data: {
        type: Object,
        default: () => {},
    },
});

const inputVariants = ref([
    { key: "outlined", title: "Outlined" },
    { key: "filled", title: "Filled" },
    { key: "solo", title: "Solo" },
    { key: "solo-filled", title: "Solo Filled" },
    { key: "solo-inverted", title: "Solo Inverted" },
]);

const buttonVariants = ref([
    { key: "outlined", title: "Outlined" },
    { key: "tonal", title: "Tonal" },
    { key: "text", title: "Text" },
    { key: "plain", title: "Plain" },
]);

const densityList = ref([
    { key: "dense", title: "Dense" },
    { key: "comfortable", title: "Comfortable" },
    { key: "default", title: "Default" },
]);

const textColors = ref(TemplateService.getTextColors());
const backgroundColors = ref(TemplateService.getBackgroundColors());
const baseColors = ref(TemplateService.getBaseColors());
</script>

<style></style>
