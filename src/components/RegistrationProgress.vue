<template>
  <div class="progress-container">
    <div class="progress-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="progress-step"
        :class="{ 
          active: index === currentStep - 1, 
          completed: index < currentStep - 1 
        }"
      >
        <div class="step-bubble">
          <span v-if="index < currentStep - 1" class="checkmark">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <p class="step-label">{{ step }}</p>
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentStep: number // 1, 2, 3 or 4
}

const props = defineProps<Props>()

const steps = ['Dades usuari', 'Dades nadó', 'Cangurs', 'Pregunes finals']

const progressPercentage = computed(() => {
  return ((props.currentStep - 1) / (steps.length - 1)) * 100
})
</script>

<style scoped>
.progress-container {
  margin-bottom: 32px;
  width: 100%;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-bubble {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #888;
  margin-bottom: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.progress-step.active .step-bubble {
  background-color: var(--ion-color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(38, 166, 154, 0.3);
}

.progress-step.completed .step-bubble {
  background-color: var(--ion-color-primary);
  color: #fff;
}

.checkmark {
  font-size: 20px;
}

.step-label {
  font-size: 12px;
  text-align: center;
  color: #888;
  margin: 0;
  font-weight: 500;
  line-height: 1.3;
}

.progress-step.active .step-label {
  color: var(--ion-color-primary);
  font-weight: 700;
}

.progress-step.completed .step-label {
  color: var(--ion-color-primary);
}

.progress-bar-container {
  height: 6px;
  background-color: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ion-color-primary), var(--ion-color-primary-tint));
  transition: width 0.4s ease;
}
</style>
