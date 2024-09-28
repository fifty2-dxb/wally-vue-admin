<template>
    <div class="w-100 pb-3">
        <div class="d-flex align-center justify-center flex-column">
            <v-btn-toggle
                class="my-3"
                v-model="selectedPlatform"
                divided
                variant="outlined"
                color="primary"
                v-if="!seeAll"
            >
                <v-btn size="40" value="ios">
                    <v-icon size="large" icon="tabler-brand-apple"></v-icon>
                </v-btn>
                <v-btn size="60" value="android" class="ml-2">
                    <v-icon size="large" icon="tabler-brand-android"></v-icon>
                </v-btn>
            </v-btn-toggle>
            <div
                class="preview-container"
                :class="seeAll ? 'd-lg-flex gap-5' : ''"
                id="previewContainer"
            >
                <div
                    class="pb-3"
                    v-if="selectedPlatform == 'ios' || seeAll"
                   
                >
                    <div class="apple-container">
                        <v-img
                            src="/images/loyalty/iphoneLayout.svg"
                            alt=""
                            :width="seeAll ? '250px' : '300px'"
                        >
                            <div class="apple-screen-container">
                                <div
                                    class="card-preview"
                                    v-if="selectedPage == 'preview'"
                                    
                                >
                                    <div class="apple-side-btn-container">
                                        <p class="mb-0">Done</p>
                                        <div
                                            class="d-flex justify-content-center align-items-center cursor-link"
                                            style="width: 20px; height: 20px"
                                        >
                                            <svg
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 16 16"
                                                class="dynamic-icon"
                                                style="
                                                    width: 14px;
                                                    height: 14px;
                                                "
                                            >
                                                <path
                                                    d="M8 16c4.377 0 8-3.631 8-8 0-4.376-3.631-8-8.008-8C3.624 0 0 3.624 0 8c0 4.369 3.631 8 8 8zm0-1.333A6.634 6.634 0 011.341 8a6.628 6.628 0 016.651-6.667A6.653 6.653 0 0114.667 8 6.636 6.636 0 018 14.667zM4.337 9.145a1.145 1.145 0 000-2.29c-.635 0-1.145.518-1.145 1.145s.51 1.145 1.145 1.145zm3.655 0c.628 0 1.145-.518 1.145-1.145S8.62 6.855 7.992 6.855c-.627 0-1.145.518-1.145 1.145s.518 1.145 1.145 1.145zm3.663 0a1.145 1.145 0 000-2.29c-.635 0-1.145.518-1.145 1.145s.51 1.145 1.145 1.145z"
                                                    fill="#000"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div
                                        class="apple-card-container"
                                        id="applePreview"
                                        :style="{
                                            background:
                                                data.template.properties
                                                    ?.background,
                                            color: data.template.properties
                                                ?.text,
                                        }"
                                    >
                                        <div class="apple-card-header mt-4">
                                            <img
                                                :src="
                                                    data.template.properties
                                                        ?.logo
                                                "
                                                style="height: 37px"
                                            />
                                            <div
                                                class="head-position"
                                                v-if="
                                                    data.template.fields?.apple
                                                        .f1 != 'empty'
                                                "
                                            >
                                                <p
                                                    class="head-position--header"
                                                >
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f1
                                                        )?.label
                                                    }}
                                                </p>
                                                <p class="head-position--value">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f1
                                                        )?.sample
                                                    }}
                                                </p>
                                            </div>
                                            <div
                                                class="head-position"
                                                v-if="
                                                    data.template.fields?.apple
                                                        .f2 != 'empty'
                                                "
                                            >
                                                <p
                                                    class="head-position--header"
                                                >
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f2
                                                        )?.label
                                                    }}
                                                </p>
                                                <p class="head-position--value">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f2
                                                        )?.sample
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="apple-strip-image">
                                            <v-img
                                                :src="
                                                    data.template.properties
                                                        ?.stampImagePreview
                                                "
                                                alt=""
                                                width="100%"
                                                cover
                                            ></v-img>
                                        </div>
                                        <div class="apple-fields">
                                            <div
                                                class="container-value"
                                                v-if="
                                                    data.template.fields?.apple
                                                        .f3 != 'empty'
                                                "
                                            >
                                                <p class="field-text">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f3
                                                        )?.label
                                                    }}
                                                </p>
                                                <p class="field-value">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f3
                                                        )?.sample
                                                    }}
                                                </p>
                                            </div>
                                            <div
                                                class="container-value"
                                                v-if="
                                                    data.template.fields?.apple
                                                        ?.f4 != 'empty'
                                                "
                                            >
                                                <p class="field-text">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f4
                                                        )?.label
                                                    }}
                                                </p>
                                                <p class="field-value">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f4
                                                        )?.sample
                                                    }}
                                                </p>
                                            </div>
                                            <div
                                                class="container-value"
                                                v-if="
                                                    data.template.fields?.apple
                                                        .f5 != 'empty'
                                                "
                                            >
                                                <p class="field-text">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f5
                                                        )?.label
                                                    }}
                                                </p>
                                                <p class="field-value">
                                                    {{
                                                        getField(
                                                            data.template.fields
                                                                ?.apple.f5
                                                        )?.sample
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="apple-barcode">
                                            <div
                                                class="barcode-container code128"
                                            >
                                                <img
                                                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAA1CAYAAADlGuYhAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARdSURBVHgB7Z2JTuNAEERNDj4aieO7ycGqsqqo0/F4ZvFC7/GeFCX2zPQ17bKBSDxM0/Tx8PAwfXx8TJvNZjoej5OO/Tqfz5cxf97tdpdjv7xW70KfhWwJrYn2ZF9jXuN1XnM4HK5rzaj/1rjR+H6/v7xH28KxnE6nm7iynZxftG07MeaR/Jb8e2xpf6LfnNea+ul4u93e+LG9mIPjnss/1ivmPzre8ue+1PmWf9uNfmKd43p9Vq7yH+OJ87L/XF/NVX+5H3J9W+NG44+Pjzd76rw+U5+R+EbqZ1Sf9/f32etTY3Gd7UQ/7t9sV8vurwgAgG8GIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIQKAchAiACgHIYI78n+NBfhqECIAKAchgiv+v+UA3w1CBADlIEQAUA5CBADlIEQAUA5CBADlIET/IXxPCP40ECIAKAch+o/ge0Lwp4IQAUA5CBEAlIMQAUA5CBEAlIMQAUA5CNE/CN8Tgr8NhAgAykGIAKAchAgAykGI/gH4xjT87SBEAFDORYg2m5965PfT6XT57Dvt+Xy+vusvMtvtdjoej9e5Yu6u7L/eaK7W6DjaysiG10R7S/5Hxm1LY3Nxap3WeEw5OY5efnN/oYp2RvNr+Ret/cl2cjwj+9cbz/aW/LXy7+3/0ngvvxH/cV6sv+ct9f9X1zfaafXnmvr0/K/t31ijWONf6W+xiYLjRDRxv9/fBWgH3rB4ser84XBozrGfHEAcj4HH957/pfE5W3PjOZ64qUv55dw0R5+9ib38ev5H9kfH2mijz7mJWvUZGc/2sr/R/Hv73xKWXn5L/r1OY7vd7k5cquvb68/fUZ9efGv617iuqnEU9pHr6zLXRnQyq7gD1yuqml5ONifldblIcZ3m+Djf+R14vnO1/PfGc2yxoLEouRF83Msv2sqxa20vv57/uf1xvnN3wHyHXFu/kTvuUv69/f+V/pjLr+df2H48lt/4VNHq/6+ub4x3rj/X1mfE/1L9ev2r46gDji8KY6+/L+d8QkoWJ0oZ40XoosZHLL1r8/KG2XG828S18dEsPh67sC50FIqW/964NyMKa/yxxudad69efi5qHndj9/Lr+e/tjzfdzRAv/tg0n61ftjfnbyT/3v63xnv59fzHH890nJ/0q+vb68+19RnZ3zX9G1EN45qYU6u/r2vf3t5uJjh5nffE+Oj39PR0o3pzvyvSOdv13Ofn5+scF0vvr6+vdwFmlvyPjEfbLy8v0xw+701WXLFQrfyMBSvOFSP5LfnP8x1T9j+3jzH2z9RPjeW4or05f6384/7Hp0zvf298KT/507qWfx1rXX7SEDonUWrV7Tvqm/tTMeb+XFOfkfh69ev1r2LQWsUd6xw/x+uu1d8/AERewCp8kcKrAAAAAElFTkSuQmCC"
                                                    alt="dc"
                                                    class="img-fluid"
                                                />
                                                <div
                                                    class="barcode-name text-center"
                                                >
                                                    %CARD_CODE%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-img>
                    </div>
                </div>
                <div
                    class="pb-3"
                    v-if="selectedPlatform == 'android' || seeAll"
                >
                    <div class="google-container">
                        <v-img
                            src="/images/loyalty/googleLayout.svg"
                            alt=""
                            :width="seeAll ? '250px' : '300px'"
                        >
                            <div class="google-screen-container"></div>
                        </v-img>
                    </div>
                </div>
            </div>
        </div>
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
    seeAll: {
        type: Boolean,
        default: false,
    },
    sticky: {
        type: Boolean,
        default: false,
    },
});

const selectedPlatform = ref("ios");
const selectedPage = ref("preview");

const getField = function (key) {
    return TemplateService.getFieldByKey(key);
};
</script>

<style>
.apple-container .apple-screen-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    padding: 35px 12px 11px;
}

.apple-container .card-preview {
    width: 100%;
    padding: 0px 12px;
}

.apple-container .apple-card-container {
    width: 100%;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 20px;
}

.apple-container .apple-side-btn-container {
    font-size: 13px;
    font-weight: 700;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-top: 20px;
}

.apple-card-container .apple-card-header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 0 11px;
    height: 48px;
    width: 100%;
}

.apple-card-header .head-position {
    text-transform: uppercase;
    font-size: 8px;
}

.apple-card-container .apple-fields {
    padding: 8px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    gap: 6px;
    height: 60px;
}

.apple-fields .field-text {
    text-transform: uppercase;
    font-size: 8px;
    margin-bottom: 8px;
    height: 10px;
}

.apple-fields .field-value {
    font-size: 12px;
    margin-bottom: 8px;
}

.apple-barcode {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    padding: 0 32px;
    color: #0e0e0e;
    height: 150px;
    -ms-flex-line-pack: stretch;
    align-content: stretch;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}

.apple-barcode .barcode-container {
    text-align: center;
    max-width: 200px;
    border-radius: 5px;
    background: #fff;
    padding: 8px 10px 2px 10px;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
}

.barcode-container img {
    margin: auto;
    width: 190px;
    padding: 0 10px;
}

.barcode-container .barcode-name {
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 5px;
}
</style>
