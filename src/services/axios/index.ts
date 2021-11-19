import axios from 'axios'

const instance = axios.create({
  // baseURL: 'https://mabacontrol.herokuapp.com/maba_venta/ajax/api.php',
  baseURL: 'https://www.dev-mabacontrol.xyz/mabacontrol/maba_venta/ajax/api.php',
})

export default instance
