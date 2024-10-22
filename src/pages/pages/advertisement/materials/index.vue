<script setup lang="ts">
import { count } from 'console';

const  materials = ref([
  {
    name: "Table tent (A5)",
    description: "Both sides are front. Can be placed on tables in a cafe, on a reception desk, and so on.",
    price: 18.36,
    imageUrl: "https://wally-images-bucket-dev.s3.eu-central-1.amazonaws.com/tabletent.png",
    count: 1
  },
  {
    name: "Table tent (A6)",
    description: "Both sides are front. Can be placed on tables in a cafe, on a reception desk, and so on.",
    price: 14.69,
    imageUrl: "https://wally-images-bucket-dev.s3.eu-central-1.amazonaws.com/tabletent.png",
    count: 1
  },
  {
    name: "Table tent with stand (A5)",
    description: "Both sides are front. Can be placed on tables in a cafe, on a reception desk, and so on.",
    price: 36.73,
    imageUrl: "https://wally-images-bucket-dev.s3.eu-central-1.amazonaws.com/tabletent-stand.png",
    count: 1
  },
  {
    name: "Table tent with stand (A6)",
    description: "Both sides are front. Can be placed on tables in a cafe, on a reception desk, and so on.",
    price: 29.38,
    imageUrl: "https://wally-images-bucket-dev.s3.eu-central-1.amazonaws.com/tabletent-stand.png",
    count: 1
  },
  {
    name: "Flyer (A6)",
    description: "On lightweight paper for a single use. You can invest in an account, invest on delivery, and so on.",
    price: 2.20,
    imageUrl: "https://wally-images-bucket-dev.s3.eu-central-1.amazonaws.com/wally-flyers.png",
    count: 20
  },
  {
    name: "Sticker (53 × 81 mm)",
    description: "Strong adhesive, but without a trace after peeling off. Can be glued to the mirror, to the surface of the cash desk and so on.",
    price: 1.36,
    imageUrl: "https://wally-images-bucket-dev.s3.eu-central-1.amazonaws.com/stickers.png",
    count: 54
  },
]);

const calculateTotal = computed(() => {
  const total = materials.value.reduce((acc, material) => acc + material.price * material.count, 0);
  return parseFloat(total.toFixed(2)); // Ensures the result is a number, not a string
});

</script>

<template>
    <div
    class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6"
  >
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Branded advertising materials') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Check out the branded materials for your campaign') }}
      </div>
    </div>
  </div>

  <v-row>
      <v-col md="8" sm="12">
        <v-card v-for="material in materials" class="mb-4">
          <v-row>
            <v-col sm="3">
              <v-img :src="material.imageUrl"></v-img>
            </v-col>
            <v-divider vertical=""></v-divider>
            <v-col sm="9">
              <v-card-title class="d-flex">{{ material.name }}<v-spacer></v-spacer><strong>{{ material.price }} dhs</strong></v-card-title>
              <v-card-text>{{ material.description }}</v-card-text>
              <v-card-actions>
                <v-btn-group
      variant="outlined"
      divided
    >
      <v-btn :disabled="material.count<1" icon="tabler-minus" @click="material.count--"></v-btn>
      <v-btn>{{ material.count }}</v-btn>
      <v-btn icon="tabler-plus" @click="material.count++"></v-btn>
    </v-btn-group>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col md="4" sm="12">
        <v-card>
          <v-card-title>Order Summary</v-card-title>
          <v-card-text>
            <v-list>
              <div  v-for="material in materials" :key="material.name">
                <v-list-item v-if="material.count > 0">
                <v-list-item-content>
                  <v-list-item-title>{{ material.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ material.count }} x {{ material.price }} dhs</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
                </div>

            </v-list>
            <v-card-title>Total: {{ calculateTotal }} dhs</v-card-title>
            
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block variant="outlined">Place order</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
</template>
