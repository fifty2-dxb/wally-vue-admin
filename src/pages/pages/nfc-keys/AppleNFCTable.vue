<script setup lang="ts">
const apikeys = [
  {
    name: 'Wally API Key',
    key: 'wally-api-key',
    permission: 'Read',
    validFor: '1 year',
    validFrom: '2021-01-01',
  }
]
</script>

<template>
  <VTable class="text-no-wrap">
    <thead>
      <tr>
        <th>
          Name
        </th>
        <th>
          Key
        </th>
        <th>
          Permission
        </th>
        <th>
          Valid For
        </th>
        <th>
          Valid From
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="item in apikeys" :key="item.name">
        <td>
          {{ item.name }}
        </td>
        <td>
          {{ item.key }}
        </td>
        <td>
          {{ item.permission }}
        </td>
        <td>
          {{ item.validFor }}
        </td>
        <td>
          {{ item.validFrom }}
        </td>
      </tr>
    </tbody>
  </VTable>
</template>
