import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import {InputComponent} from 'components/common/inputFields'
import {DropDownField} from 'components/common/dropDownField'
import {getDictionaryId, dictionaryNilSelect} from 'helpers/commonHelper.jsx'
import CurrencyInput from 'react-currency-input'
import AddressComponent from 'components/rfa_forms/addressComponent.js'
import {blankEmploymentFields} from 'constants/defaultFields'
import Cleave from 'cleave.js/react'

export default class Employment extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onEmploymentChange = this.onEmploymentChange.bind(this)
    this.onPhysicalAddressChange = this.onPhysicalAddressChange.bind(this)
  }

  onEmploymentChange (key, value) {
    const newData = this.props.employment.set(key, Immutable.fromJS(value))
    this.props.setParentState('employment', newData)
  }
  onPhysicalAddressChange (key, value) {
    const newData = this.props.employment.setIn(['physical_address', key], value)
    this.props.setParentState('employment', newData)
  }

  onSelection (key, value) {
    const newData = this.props.employment.set(key, value)
    this.props.setParentState('employment', newData)
  }

  render () {
    const employmentFields = this.props.employment.toJS()
    return (
      <div className='card-body'>
        <div className='row'>
          <form>
            <InputComponent gridClassName='col-md-4' id='employer_name'
              value={employmentFields.employer_name}
              label='Name of the Employer' placeholder=''
              type='text' onChange={(event) => this.onEmploymentChange('employer_name', event.target.value)} />
            <InputComponent gridClassName='col-md-4' id='occupation'
              value={employmentFields.occupation}
              label='Occupation' placeholder=''
              type='text' onChange={(event) => this.onEmploymentChange('occupation', event.target.value)} />
            <div className='col-md-2' >
              <label>Income</label>
              <Cleave placeholder='$0'
                id='income'
                value={employmentFields.income}
                options={{
                  prefix: '$',
                  numeral: true,
                  numeralThousandsGroupStyle: 'thousand',
                  numeralDecimalScale: 0,
                  numeralIntegerScale: 8,
                  rawValueTrimPrefix: true
                }}
                onChange={(event) => this.onEmploymentChange('income', event.target.rawValue)} />
            </div>

            <DropDownField gridClassName='col-md-2' id='income_type'
              value={employmentFields.income_type.id}
              selectClassName='reusable-select'
              optionList={this.props.salaryTypes}
              label='Interval'
              disableNullVal
              onChange={(event) => this.onEmploymentChange('income_type', dictionaryNilSelect(event.target.options))} />
            <AddressComponent
              index={this.props.index}
              stateTypes={this.props.stateTypes}
              addressTitle='Physical Address'
              id='street_address'
              addressFields={employmentFields.physical_address}
              setParentState={this.onEmploymentChange}
              parentStateKey='physical_address'
              onChange={(fieldId, event) => this.onPhysicalAddressChange(fieldId, event, this.props.index)} />
          </form>
        </div>
      </div>
    )
  }
}

Employment.propTypes = {
  employment: PropTypes.object.isRequired
}

Employment.defaultProps = {
  employment: Immutable.fromJS(blankEmploymentFields)
}
