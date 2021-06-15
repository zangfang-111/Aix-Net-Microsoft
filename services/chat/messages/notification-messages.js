const orderExecuted = (ordersForNotification) => {
  let notifications = []

  ordersForNotification.forEach(order => {
    let notification = ''

    let { side,
      trader,
      price,
      executionQuantity,
      originalQuantity,
      symbol,
      selfExecutedStatus,
      combinedExecutedStatus,
      combinedExecutedPrice,
      combinedExecutedVolume,
      combinedOriginalQuantity,
      executionType } = order

    if (symbol.split('_').length === 2) {
      symbol = symbol.split('_')[1]
    }
    const security = symbol.replace('USD', '')

    /**
        executionType =   [ T, A, B ]
        side =            [ BUY, SELL ]
        executionStatus = [ FILL, PARTIAL ]
        BOTH >> SELL(executionStatus) -> BUY(executionStatus)
    */
    let notificationCases = {
      T: {
        BUY: {
          FILL: 'That’s filled, you paid $EP for EVSI',
          PARTIAL: 'Partially filled, you paid $EP for EVSI, working the balance.'
        },
        SELL: {
          FILL: 'That’s filled, you sold EVSI at $EP',
          PARTIAL: 'Partially filled, you sold EVSI at $EP, working the balance.'
        }
      },
      A: {
        BUY: {
          FILL: 'That’s filled, you paid $EP for EVSI, still working a $CP offer for RVSI',
          PARTIAL: 'Partially filled, you paid $EP for EVSI, still working the balance here. Also still working a $CP offer for RVSI'
        },
        SELL: {
          FILL: 'That’s filled, you sold EVSI at $EP, still working a $CP bid for RVSI',
          PARTIAL: 'Partially filled, you sold EVSI at $EP, still working the balance here. Also still working a $CP bid for RVSI'
        }
      },
      B: {
        FILL: {
          FILL: 'Filled on both, you sold EVSI at $EP, and paid $CP for CVSI',
          PARTIAL: 'Filled on your offer. You sold EVSI at $EP. On your bid, partially filled, you paid $CP for CVSI, still working the balance here.'
        },
        PARTIAL: {
          FILL: 'Filled on your bid. You paid $EP for EVSI. On your offer, partially filled, you sold CVSI at $CP, still working the balance here.',
          PARTIAL: 'On your bid, partially filled, you paid $EP for EVSI, still working the balance here. Regarding your offer, partially filled, you sold CVSI at $CP, still working the balance here.'
        }
      }
    }

    let mapping = {
      EP: price,
      EV: executionQuantity,
      SI: security,
      CP: combinedExecutedPrice,
      CV: combinedExecutedVolume,
      RV: combinedOriginalQuantity - combinedExecutedVolume
    }

    let messageTemplate = ''
    if (executionType === 'B') {
      messageTemplate = (side === 'SELL') ? notificationCases['B'][selfExecutedStatus][combinedExecutedStatus] : notificationCases['B'][combinedExecutedStatus][selfExecutedStatus]
      if ((side === 'SELL' && selfExecutedStatus === 'PARTIAL' && combinedExecutedStatus === 'FILL') ||
          (side === 'SELL' && selfExecutedStatus === 'PARTIAL' && combinedExecutedStatus === 'PARTIAL') ||
          (side === 'BUY' && selfExecutedStatus === 'FILL' && combinedExecutedStatus === 'FILL') ||
          (side === 'BUY' && selfExecutedStatus === 'PARTIAL' && combinedExecutedStatus === 'FILL')) {
        mapping = {
          EP: combinedExecutedPrice,
          EV: combinedExecutedVolume,
          SI: security,
          CP: price,
          CV: executionQuantity,
          RV: originalQuantity - executionQuantity
        }
      }
    } else {
      messageTemplate = notificationCases[executionType][side][selfExecutedStatus]
    }

    notification = messageTemplate.replace(/EP|EV|SI|CP|CV|RV/gi, matched => mapping[matched])

    notifications.push({
      id: trader,
      text: notification
    })
  })
  return { messages: notifications }
}

export default {
  orderExecuted: orderExecuted
}
