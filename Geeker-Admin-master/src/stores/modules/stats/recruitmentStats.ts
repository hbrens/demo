import { defineStore } from "pinia";

import {
  ref,
  onMounted
} from 'vue'

import { generateCampusData, generateInternalData, generateODData, generatePostDocData } from './recruitmentStatsMock'



export const useRecruitmentStatsStore = defineStore('recruitmentStats', () => {

  const campusData = ref<any[]>([])
  const internalData = ref<any[]>([])
  const odData = ref<any[]>([])
  const postDocData = ref<any[]>([])

  

  onMounted(() => {
    campusData.value = generateCampusData()
    internalData.value = generateInternalData()
    odData.value = generateODData()
    postDocData.value = generatePostDocData()
  })

  return {
    campusData,
    internalData,
    odData,
    postDocData
  }
});