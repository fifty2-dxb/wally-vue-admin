<script setup lang="ts">
import { count } from 'console';

const  materials = ref([
  {
    name: "Table Tent",
    description: "Both sides are front. Can be placed on tables in a cafe, on a reception desk, and so on.",
    price: 5.25,
    imageUrl: "https://getpassfiles.fra1.digitaloceanspaces.com/getpass/promotional_materials/table-tent-branded_en@3x.png",
    count: 1
  },
  {
    name: "Table Tent 2",
    description: "Table Tent Description",
    price: 6.25,
    imageUrl: "https://getpassfiles.fra1.digitaloceanspaces.com/getpass/promotional_materials/table-tent-branded_en@3x.png",
    count: 2
  },
]);

const calculateTotal = computed(() => {
  return materials.value.reduce((acc, material) => acc + material.price * material.count, 0);
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
