const getSecurity = (responseSecurity) => {
  if (responseSecurity.split('_').length === 2) {
    return responseSecurity.split('_')[1]
  } else {
    return responseSecurity
  }
}

export const orderView = (finOrder) => {
  /**
   * quantityFractionBase - is used to specifie a quantity like 0.5
   * In this case: quantity wil be 5 and quantityFractionBase is 10
   */
  return {
    id: finOrder.id,
    firm: finOrder.clearingFirm,
    security: getSecurity(finOrder.symbol),
    status: finOrder.orderStatus,
    side: finOrder.side,
    userid: finOrder.userId,
    trader: finOrder.trader,
    price: finOrder.price,
    quantity: finOrder.quantity / finOrder.quantityFractionBase,
    origQty: finOrder.originalQuantity / finOrder.quantityFractionBase,
    liveQty: finOrder.liveQuantity / finOrder.quantityFractionBase,
    execQty: finOrder.executionQuantity / finOrder.quantityFractionBase,
    referenceNumber: finOrder.refno,
    rootReferenceNumber: finOrder.rootRef,
    isQuote: finOrder.isQuote
  }
}

export default {
  orderView
}
