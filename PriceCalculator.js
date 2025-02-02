class PriceCalculator {
  selectors = {
    root: '[data-js-calculator]',
    serviceCheckbox: '[data-js-service-checkbox]',
    packageCheckbox: '[data-js-package-checkbox]',
    totalPrice: '[data-js-calculator-total-price]',
    discount: '[data-js-discount]'
  }

  attributes = {
    related: 'data-js-related'
  }

  initialState = {
    selectedServicePrices: [],
    selectedPackagePrice: 0,
    totalPrice: 0,
    discount: 0,
    relatedArray: []
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)
    this.serviceCheckboxElements = this.rootElement.querySelectorAll(this.selectors.serviceCheckbox)
    this.packageCheckboxElements = this.rootElement.querySelectorAll(this.selectors.packageCheckbox)
    this.totalPriceElement = this.rootElement.querySelector(this.selectors.totalPrice)
    this.discountElement = this.rootElement.querySelector(this.selectors.discount)
    this.state = { ...this.initialState }

    this.bindEvents()
  }

  disableAllCheckboxInArray(checkboxArray) {
    checkboxArray.forEach((checkboxElement) => {
      checkboxElement.checked = false

      if (checkboxArray === this.packageCheckboxElements) {
        this.state.selectedPackagePrice = this.initialState.selectedPackagePrice
        this.state.relatedArray = []
      }
    })
  }

  pushSelectedServicesInArray(checkboxArray) {
    this.state.selectedServicePrices = []

    checkboxArray.forEach((checkboxElement) => {
      if (checkboxElement.checked) {
        this.state.selectedServicePrices.push(checkboxElement.value)
      }
    })
  }

  calcDiscount(price) {
    const countOfSelectedServices = this.state.selectedServicePrices.length

    if (countOfSelectedServices < 2) {
      this.state.discount = 0
      this.discountElement.textContent = ''
      return
    }
    if (countOfSelectedServices <= 3) {
      this.state.discount = price * 0.05
      this.discountElement.textContent = '5%'
      return
    }
    if (countOfSelectedServices >= 4 && countOfSelectedServices < 6) {
      this.state.discount = price * 0.1
      this.discountElement.textContent = '10%'
      return
    }

    this.state.discount = price * 0.15
    this.discountElement.textContent = '15%'
  }

  countTotalPriceWithDiscount(price) {
    this.calcDiscount(price)
    return price - this.state.discount
  }

  getTotalPrice(price) {
    price = this.state.selectedServicePrices.reduce((totalPrice, servicePrice) => {
      return (totalPrice += Number(servicePrice))
    }, 0)

    price = this.countTotalPriceWithDiscount(price)

    price += Number(this.state.selectedPackagePrice)

    return price
  }

  countTotalPrice() {
    this.pushSelectedServicesInArray(this.serviceCheckboxElements)

    this.state.totalPrice = this.getTotalPrice(this.state.totalPrice)
    this.totalPriceElement.textContent = new Intl.NumberFormat('ru-RU').format(this.state.totalPrice)
  }

  onServiceCheckboxChange = (event) => {
    const { target } = event

    if (this.state.relatedArray.includes(target.id) || this.state.relatedArray.includes('all')) {
      this.disableAllCheckboxInArray(this.packageCheckboxElements)
    }

    this.countTotalPrice()
  }

  onPackageCheckboxChange = (event) => {
    const { target } = event
    this.state.relatedArray = []
    this.state.selectedPackagePrice = this.initialState.selectedPackagePrice

    this.packageCheckboxElements.forEach((packageCheckboxElement) => {
      if (packageCheckboxElement !== target) {
        packageCheckboxElement.checked = false
      }
    })

    if (target.checked) {
      this.state.relatedArray = target.getAttribute(this.attributes.related).split(', ')
      this.state.selectedPackagePrice = target.value

      if (this.state.relatedArray.includes('all')) {
        this.disableAllCheckboxInArray(this.serviceCheckboxElements)
      }

      this.state.relatedArray.forEach((id) => {
        this.serviceCheckboxElements.forEach((serviceCheckboxElement) => {
          if (serviceCheckboxElement.id === id) {
            serviceCheckboxElement.checked = false
          }
        })
      })
    }

    this.countTotalPrice()
  }

  bindEvents() {
    this.packageCheckboxElements.forEach((packageCheckboxElement) => {
      packageCheckboxElement.addEventListener('change', this.onPackageCheckboxChange)
    })
    this.serviceCheckboxElements.forEach((serviceCheckboxElement) => {
      serviceCheckboxElement.addEventListener('change', this.onServiceCheckboxChange)
    })
  }
}

new PriceCalculator()
