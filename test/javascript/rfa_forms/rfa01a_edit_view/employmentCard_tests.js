import React from 'react'
import Immutable, {isImmutable} from 'immutable'
import Employment from 'rfa_forms/rfa01a_edit_view/employmentCard.jsx'
import ReactDOM from 'react-dom'
import {shallow, mount} from 'enzyme'
import {salaryTypes, educationLevels, ethnicityTypes, genderTypes, stateTypes} from './../../helpers/constants'
import ShallowRenderer from 'react-test-renderer/shallow'

describe('Employment Card', function () {
  const props = {
    stateTypes: stateTypes.items,
    salaryTypes: salaryTypes.items
  }
  const applicantFields = Immutable.fromJS({
    employer_name: 'System Integration',
    occupation: 'Developer',
    income: 'xxxxxx',
    income_type: {
      id: '1',
      value: 'Yearly'
    },
    physical_address: {
      street_address: '2870 Gateway Oaks',
      zip: '95833',
      city: 'Sacramento',
      state: {
        id: '6',
        value: 'California'
      }
    }
  })
  let employmentCardComp, onEmploymentChange, setCardState
  // const employmentCard = new ShallowRenderer()
  // const cardRendered = employmentCard.render(<Employment {...props} />)

  // it('verify Resident Address fields', function () {
  //   let employmentClassName = cardRendered
  //   expect(employmentClassName.props.className).toBe('card-body')
  // })

  beforeEach(() => {
    onEmploymentChange = jasmine.createSpy('onEmploymentChange')
    setCardState = jasmine.createSpy('setParentState')
    employmentCardComp = shallow(<Employment
      index={0}
      stateTypes={stateTypes.items}
      salaryTypes={salaryTypes.items}
      employment={applicantFields}
      setParentState={setCardState} />)
  })
  it('verify employment address change object type', () => {
    let employmentFields = applicantFields
    const newAddress = {
      street_address: '3000 West Elk',
      zip: '95833',
      city: '',
      state: {
        id: '6',
        value: 'California'
      }
    }

    // method call using JS object
    employmentCardComp.instance().onEmploymentChange('physical_address', newAddress)

    // parent called with full immutable
    employmentFields = employmentFields.set('physical_address', Immutable.fromJS(newAddress))
    expect(setCardState).toHaveBeenCalledWith('employment', employmentFields)
  })

  it('verify Employment Name Change', () => {
    let employmentNameField = employmentCardComp.find('#employer_name')
    spyOn(employmentCardComp.instance(), 'onEmploymentChange').and.callThrough()
    employmentNameField.simulate('change', {target: {value: 'Child Welfare'}})
    expect(employmentCardComp.instance().onEmploymentChange).toHaveBeenCalledWith('employer_name', 'Child Welfare')
    let newApplicantFields = applicantFields.set('employer_name', 'Child Welfare')
    expect(setCardState).toHaveBeenCalledWith('employment', newApplicantFields)
  })
  it('verify Occupation Change', () => {
    let occupationField = employmentCardComp.find('#occupation')
    spyOn(employmentCardComp.instance(), 'onEmploymentChange').and.callThrough()
    occupationField.simulate('change', {target: {value: 'Lead Developer'}})
    expect(employmentCardComp.instance().onEmploymentChange).toHaveBeenCalledWith('occupation', 'Lead Developer')
  })
  it('verify Income Change', () => {
    let incomeField = employmentCardComp.find('#income')
    employmentCardComp.update()
    const spy = spyOn(employmentCardComp.instance(), 'onEmploymentChange').and.callThrough()
    incomeField.simulate('change', {target: {rawValue: '50'}})
    employmentCardComp.update()
    expect(employmentCardComp.instance().onEmploymentChange).toHaveBeenCalledWith('income', '50')
  })
  it('verify Income Type Change', () => {
    let incomeTypeField = employmentCardComp.find('#income_type')
    employmentCardComp.update()
    spyOn(employmentCardComp.instance(), 'onEmploymentChange').and.callThrough()
    incomeTypeField.simulate('change', {target: {options: {'2': {value: '2', text: 'Monthly'}, selectedIndex: 2}}})
    expect(employmentCardComp.instance().onEmploymentChange).toHaveBeenCalledWith('income_type', {id: '2', value: 'Monthly'})
  })
  describe('Reusable address component mount', () => {
    beforeEach(() => {
      employmentCardComp = mount(<Employment
        index={0}
        stateTypes={stateTypes.items}
        salaryTypes={salaryTypes.items}
        employment={applicantFields}
        setParentState={setCardState} />)
    })
    it('verify propTypes has physical Address as an immutable object', () => {
      let physAddress = employmentCardComp.instance().props.employment.get('physical_address')
      const isAMap = Immutable.Map.isMap(physAddress)
      expect(isAMap).toBe(true)
    })
    it('verify Physical Street Address Change', () => {
      let streetAddressField = employmentCardComp.find('#Residentialstreet_address').hostNodes()
      spyOn(employmentCardComp.instance(), 'onPhysicalAddressChange').and.callThrough()
      streetAddressField.simulate('change', {target: {value: '2035 W El Camino Ave'}})
      expect(employmentCardComp.instance().onPhysicalAddressChange).toHaveBeenCalledWith('street_address', '2035 W El Camino Ave', 0)
    })
    it('verify zip Code Change', () => {
      let physicalZipField = employmentCardComp.find('#Residentialzip').hostNodes()
      spyOn(employmentCardComp.instance(), 'onPhysicalAddressChange').and.callThrough()
      physicalZipField.simulate('change', {target: {value: '95832'}})
      expect(employmentCardComp.instance().onPhysicalAddressChange).toHaveBeenCalledWith('zip', '95832', 0)
      const updateApplicantFields = applicantFields.setIn(['physical_address', 'zip'], '95832')
      expect(setCardState).toHaveBeenCalledWith('employment', updateApplicantFields)
    })
    it('verify City Change', () => {
      let physicalCityField = employmentCardComp.find('#Residentialcity').hostNodes()
      spyOn(employmentCardComp.instance(), 'onPhysicalAddressChange').and.callThrough()
      physicalCityField.simulate('change', {target: {value: 'San Mateo'}})
      expect(employmentCardComp.instance().onPhysicalAddressChange).toHaveBeenCalledWith('city', 'San Mateo', 0)
    })
    it('verify State Type Change', () => {
      let physicalStateField = employmentCardComp.find('.Select-control').at(0)
      spyOn(employmentCardComp.instance(), 'onPhysicalAddressChange').and.callThrough()
      employmentCardComp.update()
      physicalStateField.simulate('keyDown', { keyCode: 40 })
      physicalStateField.simulate('keyDown', { keyCode: 13 })

      expect(employmentCardComp.instance().onPhysicalAddressChange).toHaveBeenCalledWith('state', { id: 'CA', value: 'California' }, 0)
    })
  })
})
