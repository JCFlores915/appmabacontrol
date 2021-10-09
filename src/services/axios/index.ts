import axios from 'axios'

const instance = axios.create({
  // baseURL: 'https://mabacontrol.herokuapp.com/maba_venta/ajax/api.php',
  baseURL: 'http://3.131.99.111/mabacontrol/maba_venta/ajax/api.php',
})

export default instance
