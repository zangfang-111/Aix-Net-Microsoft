import { success, notFound } from '../../services/response/'
import Trader from './model'
import { sign } from '../../services/jwt'
import errors from '../../services/common/errors'

export const showMe = (req, res) => {
  res.json(req.user.view(true))
}

export const create = ({ bodymen: { body } }, res, next) => {
  Trader.create(body)
    .then(trader => {
      sign(trader.id)
        .then((token) => ({ token, trader: trader.view(true) }))
        .then(success(res, 201))
    })
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'telegramId',
          message: 'telegramId already registered'
        })
      } else if (err === errors.InvalidTelegramIdError) {
        res.status(409).json({
          valid: false,
          param: 'telegramId',
          message: 'telegramId is invalid'
        })
      } else {
        next(err)
      }
    })
}

export const update = ({ bodymen: { body }, params, user }, res, next) => {
  const trader = user

  Trader.findById(params.id === 'me' ? trader.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = trader.id === result.id

      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other trader\'s data'
        })
        return null
      }
      return result
    })
    .then((trader) => trader ? Object.assign(trader, body).save() : null)
    .then((trader) => trader ? trader.view(true) : null)
    .then(success(res))
    .catch(next)
}

export const updatePassword = ({ bodymen: { body }, params, user }, res, next) => {
  const trader = user

  Trader.findById(params.id === 'me' ? trader.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = trader.id === result.id
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: 'password',
          message: 'You can\'t change other trader\'s password'
        })
        return null
      }
      return result
    })
    .then((trader) => trader ? trader.set({ password: body.password }).save() : null)
    .then((trader) => trader ? trader.view(true) : null)
    .then(success(res))
    .catch(next)
}

export const destroy = ({ params }, res, next) =>
  Trader.findById(params.id)
    .then(notFound(res))
    .then((trader) => trader ? trader.remove() : null)
    .then(success(res, 204))
    .catch(next)
