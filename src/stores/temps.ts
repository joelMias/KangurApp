import { ref } from 'vue'

const STORAGE_KEY = 'lastCronoTemps'

export const cronoTemp = ref<number>(0)

export function setCronoTemp(v: number) {
  cronoTemp.value = v
  try { localStorage.setItem(STORAGE_KEY, String(v)) } catch (e) { /* ignore */ }
}

export function clearCronoTemp() {
  cronoTemp.value = 0
  try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* ignore */ }
}

export function loadCronoTempFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) cronoTemp.value = Number(raw)
  } catch (e) { /* ignore */ }
}

export default {
  cronoTemp,
  setCronoTemp,
  clearCronoTemp,
  loadCronoTempFromStorage
}
