import { USER_TYPES } from '../../constants'

const traders = [
  {
    telegramId: 509318934,
    mobileNumber: '0752436045',
    firstName: 'Salt',
    lastName: '',
    financialInstrumentsInUse: [],
    email: 'salt_123456@gmail.com',
    traderType: USER_TYPES.MARKET_MAKER,
    bankDetails: {
      beneficiaryName: 'Salt Sodium',
      beneficiaryAddress: 'Condiments street, 20, 4000 Cluj-Napoca, Romania',
      accountNumber: 'RO49 AAAA 1 B31 0075 9384 0000',
      routingNumber: 123454321,
      bankName: 'Banca Transilvania',
      bankAddress: 'Calea Dorbantilor 45'
    },
    wallet: [{
      currency: 'BTC',
      address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    },
    {
      currency: 'ETH',
      address: '0x123f681646d4a755815f9cb19e1acc8565a0c2ac'
    }]
  },
  {
    telegramId: 491337682,
    mobileNumber: '0720908069',
    firstName: 'John',
    lastName: '',
    financialInstrumentsInUse: [],
    email: 'john_123456@gmail.com',
    traderType: USER_TYPES.MARKET_MAKER,
    bankDetails: {
      beneficiaryName: 'John Doe',
      beneficiaryAddress: 'London street, 24, 4000 London, UK',
      accountNumber: 'RO49 AAAA 1 B31 0075 8888 77777',
      routingNumber: 123454321,
      bankName: 'Banca Transilvania',
      bankAddress: 'Calea Dorbantilor 45'
    },
    wallet: [{
      currency: 'BTC',
      address: 'a1a4341b-cf63-4e00-8e1a-c59da5375370'
    },
    {
      currency: 'ETH',
      address: '12f7c4c8977a5b9addb52b83e23c9d0f3b89be15'
    }]
  }
]

export default traders
