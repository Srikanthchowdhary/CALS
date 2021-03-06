import React from 'react'
import Immutable from 'immutable'
import PhoneComponent, {blankPhoneNumberFields} from 'rfa_forms/rfa01a_edit_view/phoneNumberCardsGroup'
import {PhoneNumberField} from 'components/common/phoneNumberFields'
import {shallow, mount} from 'enzyme'
import {phoneTypes} from './../../helpers/constants'
import Validator from 'helpers/validator.js'
var TestUtils = require('react-dom/test-utils')

describe('Verify Phone Card Component View', function () {
  let component
  let props
  const phoneNumber = {number: '3333-222-5545',
    phone_type: {id: '1', value: 'Cell'},
    preferred: false}

  let setParentStateSpy // = jasmine.createSpy()

  beforeEach(() => {
    setParentStateSpy = jasmine.createSpy('setParentState')
    props = {
      phoneTypes: phoneTypes,
      phones: Immutable.fromJS([phoneNumber]),
      setParentState: setParentStateSpy,
      validator: new Validator({})
    }

    component = shallow(
      <PhoneComponent {...props} />
    )
  })

  describe('Verify Phone Card Component View', () => {
    it('has class name', function () {
      expect(component.find('.card-body').length).toEqual(1)
    })
    it('expcet children to be array', function () {
      expect(component.children.length).toEqual(1)
    })
  })

  describe('when "Add new phone number" is clicked', () => {
    it('expect phone card to be button', function () {
      const x = component.find('button[className="btn btn-default"]')
      expect(component.find('button[className="btn btn-default"]').type()).toEqual('button')
    })

    it('calls addCard and resulting phones contains 2 phone numbers', () => {
      spyOn(component.instance(), 'addCard').and.callThrough()
      component.instance().addCard()
      // component.find('.btn.btn-default').simulate('click')
      expect(component.instance().addCard).toHaveBeenCalled()

      // build data that parent should be called with
      let newData = Immutable.fromJS([])
      newData = newData.push(Immutable.fromJS(phoneNumber))
      newData = newData.push(Immutable.fromJS(blankPhoneNumberFields))

      // parent should be called with 2 phone numbers, 1st with data and 2nd with blank
      expect(setParentStateSpy).toHaveBeenCalledWith('phones', newData)
    })
  })

  describe('when close phone card is clicked', () => {
    it('Clears data when 1 phone number is present', () => {
      spyOn(component.instance(), 'onPhoneClickClose').and.callThrough()
      component.find('.remove-btn').simulate('click')
      expect(component.instance().onPhoneClickClose).toHaveBeenCalledWith(0)

      const newData = Immutable.fromJS([]).push(Immutable.fromJS(blankPhoneNumberFields))

      // check if setParent is called
      expect(setParentStateSpy).toHaveBeenCalledWith('phones', newData)
    })

    it('Deletes a phone when 2 phone numbers are present', () => {
      let data = Immutable.fromJS([phoneNumber, blankPhoneNumberFields])

      component.setProps({phones: data})

      spyOn(component.instance(), 'onPhoneClickClose').and.callThrough()
      component.find('.remove-btn').at(1).simulate('click')
      expect(component.instance().onPhoneClickClose).toHaveBeenCalledWith(1)

      data = data.delete(1)

      // check if setParent is called
      expect(setParentStateSpy).toHaveBeenCalledWith('phones', data)
      expect(props.phones.size).toEqual(1)
    })
  })

  // describe('validate phone change', () => {
  //   it('allows to change type', () => {
  //     const newType = {id: '2', value: 'Mobile'}
  //     console.log(component.html())
  //     // why do I have to update this?
  //     component.update()
  //     console.log(component.html())
  //     component.find('#phone_type').simulate('change', {target: {value: '2'}})

  //     expect(component.instance().onPhoneFieldChange).toHaveBeenCalledWith(0, newType, 'phone_type')

  //     let tmpData = [phoneNumber]
  //     tmpData[0].phone_type = newType
  //     expect(setParentStateSpy).toHaveBeenCalledWith('phones', tmpData)
  //   })
  // })
})

describe('Preferred logic', () => {
  let component
  let props
  let phoneNumbers = Immutable.fromJS([{number: '3333-222-5545',
    phone_type: {id: '1', value: 'Cell'},
    preferred: false}])
  let setParentStateSpy
  // let onPhoneFieldChangeSpy

  beforeEach(() => {
    setParentStateSpy = jasmine.createSpy('setParentState')
    props = {
      phoneTypes: phoneTypes,
      phones: phoneNumbers,
      validator: new Validator({}),
      setParentState: setParentStateSpy
    }

    // onPhoneFieldChangeSpy = spyOn(PhoneComponent.prototype, 'onPhoneFieldChange').and.callThrough()
    component = mount(
      <PhoneComponent {...props} />
    )
    spyOn(component.instance(), 'onPhoneFieldChange').and.callThrough()
  })

  it('only 1 phone number is preferred', () => {
    let tmpData = phoneNumbers.push(Immutable.fromJS({number: '999-444-2323',
      phone_type: {id: '1', value: 'Cell'},
      preferred: true}))

    component.setProps({phones: tmpData})
    component.find('input[type="checkbox"]').at(0).simulate('change', {target: {checked: true}})
    expect(component.instance().onPhoneFieldChange).toHaveBeenCalledWith(0, true, 'preferred')

    let newData = tmpData.setIn([0, 'preferred'], true).setIn([1, 'preferred'], false)
    expect(setParentStateSpy).toHaveBeenCalledWith('phones', newData)
  })

  it('allows to change number', () => {
    const newNumber = '8884442323'
    component.find('input[type="text"]').simulate('change', {target: {value: newNumber}})

    let newData = phoneNumbers.setIn([0, 'number'], newNumber)
    expect(setParentStateSpy).toHaveBeenCalledWith('phones', newData)
  })

  it('allows to change type', () => {
    const newType = {id: '2', value: 'Mobile'}
    component.setProps({phones: phoneNumbers.setIn([0, 'phone_type'], newType)})
    component.find('select[id="phone_type"]').simulate('change', {target: {options: {'1': {value: '2', text: 'Mobile'}, selectedIndex: 1}}})

    expect(component.instance().onPhoneFieldChange).toHaveBeenCalledWith(0, newType, 'phone_type')
    // expect(onPhoneFieldChangeSpy).toHaveBeenCalledWith(0, newType, 'phone_type')

    const tmpData = phoneNumbers.setIn([0, 'phone_type'], newType)
    expect(setParentStateSpy).toHaveBeenCalledWith('phones', tmpData)
  })
})
