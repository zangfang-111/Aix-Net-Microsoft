import {
  MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC,
  MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC
} from '../constants'

class DecisionController {
  constructor () {
    this.MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC =
      MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC
    this.MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC =
      MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC
  }
}

export default DecisionController
