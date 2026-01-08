/**
 * Sample data for the Quote Builder
 * In production, this would come from a backend API
 */
export const initialData = {
  // Project-level metadata for quote document header
  projectInfo: {
    projectName: '',
    projectNumber: '',
    bidDate: '',
    customerName: '',
    attention: '',
    engineerCompany: '',
    location: '',
    quoteNotes: '',
    addendums: '',
    salesRep: ''
  },
  suppliers: [
    { id: 'sup1', name: 'SVL' },
    { id: 'sup2', name: 'ControlCo' }
  ],
  manufacturers: [
    { id: 'mfr1', name: 'AAON' },
    { id: 'mfr2', name: 'Tridium' },
    { id: 'mfr3', name: 'Daikin' }
  ],
  equipmentTypes: [
    { id: 'et1', name: 'RTU' },
    { id: 'et2', name: 'Accessory' },
    { id: 'et3', name: 'Curb' },
    { id: 'et4', name: 'Controls' },
    { id: 'et5', name: 'Service' }
  ],
  quotePackages: [
    { id: 'pkg1', name: 'Rooftop Units', defaultMU: 1.35, sortOrder: 1 }
  ],
  equipmentGroups: [
    {
      id: 'grp1',
      packageId: 'pkg1',
      name: 'RTU - AAON RN Series',
      sortOrder: 1,
      equipmentHeading: '',
      tag: '',
      equipmentBullets: '',
      notes: ''
    }
  ],
  lineItems: [
    {
      id: 'li1', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 3, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et1',
      model: 'RN-030', listPrice: 18000, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0.05, freight: 1200, markup: 1.35, shorthand: '(3) RN-030', sortOrder: 1
    },
    {
      id: 'li2', equipmentGroupId: 'grp1', parentLineItemId: 'li1',
      qty: 3, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et2',
      model: 'Economizer', listPrice: 1100, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0, freight: 0, markup: 1.35, shorthand: 'Economizers', sortOrder: 1
    },
    {
      id: 'li3', equipmentGroupId: 'grp1', parentLineItemId: 'li1',
      qty: 3, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et2',
      model: 'Hail Guards', listPrice: 600, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0, freight: 0, markup: 1.35, shorthand: 'Hail Guards', sortOrder: 2
    },
    {
      id: 'li4', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 2, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et1',
      model: 'RN-040', listPrice: 22000, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0.05, freight: 800, markup: 1.35, shorthand: '(2) RN-040', sortOrder: 2
    },
    {
      id: 'li5', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 5, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et3',
      model: 'RN-Curb', listPrice: 1200, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0, freight: 400, markup: 1.35, shorthand: 'Roof Curbs', sortOrder: 3
    },
    {
      id: 'li6', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 1, supplierId: 'sup2', manufacturerId: 'mfr2', equipmentTypeId: 'et4',
      model: 'JACE-8000', listPrice: 4500, priceIncrease: 0, multiplier: 0.65,
      pay: 0, freight: 0, markup: 1.40, shorthand: 'Controls', sortOrder: 4
    },
    {
      id: 'li7', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 1, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et5',
      model: 'Startup', listPrice: 2100, priceIncrease: 0, multiplier: 1.0,
      pay: 0, freight: 0, markup: 1.35, shorthand: 'Startup', sortOrder: 5
    }
  ]
};
