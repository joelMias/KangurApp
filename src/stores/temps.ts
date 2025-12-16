import { ref } from 'vue'

const STORAGE_KEY = 'lastCronoTemps'

export const cronoTemp = ref<number>(0)

export function setCronoTemp(v: number) {
  cronoTemp.value = v
  try { 
    localStorage.setItem(STORAGE_KEY, String(v)) 
  } catch (e) {  
    
  }
}

export function clearCronoTemp() {
  cronoTemp.value = 0
  try { 
    localStorage.removeItem(STORAGE_KEY) 
  } catch (e) {  

  }
}

export function loadCronoTempFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) cronoTemp.value = Number(raw)
  } catch (e) { 
 }
}

export default {
  cronoTemp,
  setCronoTemp,
  clearCronoTemp,
  loadCronoTempFromStorage
}
