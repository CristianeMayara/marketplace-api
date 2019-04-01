const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')

    if (purchaseAd.purchasedBy) {
      return res
        .status(400)
        .json({ error: 'This product has already been sold.' })
    }

    const user = await User.findById(req.userId)

    const purchase = await Purchase.create({ ad })

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    return res.json(purchase)
  }

  async accept (req, res) {
    const purchaseId = req.params.id
    const purchase = await Purchase.findById(purchaseId)

    const ad = await Ad.findByIdAndUpdate(purchase.ad, {
      purchasedBy: purchaseId
    })
    return res.json(ad)
  }
}

module.exports = new PurchaseController()
