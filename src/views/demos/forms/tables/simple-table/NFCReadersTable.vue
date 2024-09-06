<script setup lang="ts">
const apikeys = [
  {
    online: 1,
    serialNumber: 'CC216995',
    model: 'VTAP100 PRO',
    configuration: 'Wally Tap Configuration',
    application: 'Wally Tap',
    location: 'Front Desk',
  }
]

const resolveOnline = (online: number) => {
  if (online === 1)
    return { color: 'success', text: 'Online' }
  else if (online === 0)
    return { color: 'error', text: 'Offline' }
}
</script>

<template>
  <VTable class="text-no-wrap">
    <thead>
      <tr>
        <th>
          Online
        </th>
        <th>
          Serial No.
        </th>
        <th>
          Model
        </th>
        <th>
          Location
        </th>
        <th>
          Configuration
        </th>
        <th>
          Application
        </th>
        <th>
          Actions
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="item in apikeys" :key="item.serialNumber">
        <td>
          <VChip :color="resolveOnline(item.online).color" class="font-weight-medium" size="small">
            {{ resolveOnline(item.online).text }}
          </VChip>
        </td>
        <td>
          {{ item.serialNumber }}
        </td>
        <td>
          {{ item.model }}
        </td>
        <td>
          {{ item.location }}
        </td>
        <td>
          {{ item.configuration }}
        </td>
        <td>
          {{ item.application }}
        </td>
        <td>
        </td>
      </tr>
    </tbody>
  </VTable>
</template>
