import { createPinia } from 'pinia'
import type { App } from 'vue'
import resetStore from '@core/stores/cleanStorePlugin'

export const store = createPinia()
store.use(resetStore)

export default function (app: App) {
  app.use(store)
}
