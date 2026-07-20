import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

export const api = {
  getNetwork: (date) => axios.get(`${BASE_URL}/network/${date}`),
  getEvents: () => axios.get(`${BASE_URL}/events`),
  getBaseline: () => axios.get(`${BASE_URL}/baseline`),
  getNetworkConfig: () => axios.get(`${BASE_URL}/network-config`),
  simulate: (scenario) => axios.post(`${BASE_URL}/simulate`, scenario),
  compare: (scenarios) => axios.post(`${BASE_URL}/compare`, { scenarios }),
  chat: (question, date, scenario = null) =>
    axios.post(`${BASE_URL}/chat`, {
      question,
      current_date: date,
      scenario
    }),
  getProcurementPlan: (scenario) =>
    axios.post(`${BASE_URL}/procurement-plan`, scenario)
}