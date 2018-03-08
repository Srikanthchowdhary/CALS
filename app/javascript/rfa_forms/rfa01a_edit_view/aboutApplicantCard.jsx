import React from 'react'
import PropTypes from 'prop-types'
import InputField from 'components/common/inputField.jsx'
import {DropDownFormField} from 'components/common/dropDownFormField.jsx'
import {DropDownField} from 'components/common/dropDownField'
import {DateField} from 'components/common/dateFields'
import {valuePresent, getDictionaryId, dictionaryNilSelect, dictionaryNilSelectValue, dictionaryNilSelectText, FormatDateForDisplay, FormatDateForPersistance} from 'helpers/commonHelper.jsx'
import Validator from 'helpers/validator'
import {fieldErrorsAsImmutableSet} from 'helpers/validationHelper.jsx'
import Cleave from 'cleave.js/react'

export default class AboutApplicant extends React.PureComponent {
  constructor (props) {
    super(props)

    this.dateOfBirthId = this.props.idPrefix + 'date_of_birth'
    this.driversLicenseNumberId = this.props.idPrefix + 'driver_license_number'
    this.driversLicenseStateId = this.props.idPrefix + 'driver_license_state'

    this.props.validator.addNewValidation(
      {
        [this.dateOfBirthId]: [{
          rule: 'isValidDate',
          message: 'date is invalid'}],
        [this.driversLicenseStateId]: [{
          rule: 'isRequiredIf',
          message: 'State is required',
          condition: () => this.isValuePresent('driver_license_number')
        }],
        [this.driversLicenseNumberId]: [{
          rule: 'isRequiredIf',
          message: 'DL/ID is required',
          condition: () => this.isValuePresent('driver_license_state')
        }]
      }
    )

    this.validateDLcombo = this.validateDLcombo.bind(this)
  }

  isValuePresent (fieldName) {
    const val = this.props.applicantFields[fieldName]
    return valuePresent(val) && (val !== '')
  }

  validateDLcombo (currentField, currentFieldValue, otherField, otherFieldPropName) {
    // validate current field
    this.props.validator.validateFieldSetErrorState(currentField, currentFieldValue)

    // validate other field
    this.props.validator.validateFieldSetErrorState(otherField, this.props.applicantFields[otherFieldPropName])
  }

  render () {
    // console.log('rendering - AboutApplicantCard.js')

    const aboutApplicantFields = this.props.applicantFields.toJS()

    return (
      <div className='card-body'>
        <div className='row'>
          <form>
            <div className='col-md-12'>
              <DropDownField id='highest_education_level' gridClassName='col-md-4'
                selectClassName='reusable-select'
                value={getDictionaryId(aboutApplicantFields.highest_education_level)}
                optionList={this.props.educationLevels}
                label='Highest Level of Education'
                onChange={(event) => this.props.setParentState('highest_education_level', dictionaryNilSelect(event.target.options))} />

              <DateField
                gridClassName='col-md-4' label='Date of Birth (required)' id={this.dateOfBirthId}
                value={FormatDateForDisplay(aboutApplicantFields.date_of_birth)}
                errors={fieldErrorsAsImmutableSet(this.props.errors.date_of_birth)}
                onChange={(event) => this.props.setParentState('date_of_birth', FormatDateForPersistance(event.target.value))}
                onBlur={(event) => this.props.validator.validateFieldSetErrorState(this.dateOfBirthId, event.target.value)} />

              <DropDownField gridClassName='col-md-4' id='gender'
                selectClassName='reusable-select'
                value={getDictionaryId(aboutApplicantFields.gender)}
                optionList={this.props.genderTypes}
                label='Gender'
                onChange={(event) => this.props.setParentState('gender', dictionaryNilSelect(event.target.options))} />
            </div>
            <div className='col-md-12'>
              <DropDownField gridClassName='col-md-4' id='ethnicity'
                value={getDictionaryId(aboutApplicantFields.ethnicity)}
                selectClassName='reusable-select'
                optionList={this.props.ethnicityTypes}
                label='Race / Ethnicity'
                onChange={(event) => this.props.setParentState('ethnicity', {id: dictionaryNilSelectValue(event.target.options), value: dictionaryNilSelectText(event.target.options)})} />

              <InputField gridClassName='col-md-4' id={this.driversLicenseNumberId}
                value={aboutApplicantFields.driver_license_number}
                label='Driver License Number' placeholder=''
                type='text' onChange={(event) => this.props.setParentState('driver_license_number', event.target.value)}
                errors={fieldErrorsAsImmutableSet(this.props.errors.driver_license_number)}
                onBlur={(event) => this.validateDLcombo(this.driversLicenseNumberId, event.target.value, this.driversLicenseStateId, 'driver_license_state')} />

              <DropDownFormField gridClassName='col-md-4' id={this.driversLicenseStateId}
                selectClassName='reusable-select'
                value={getDictionaryId(aboutApplicantFields.driver_license_state)}
                optionList={this.props.stateTypes}
                label={aboutApplicantFields.driver_license_number ? 'Driver License State (required)' : 'Driver License State'}
                onChange={(event) => this.props.setParentState('driver_license_state', dictionaryNilSelect(event.target.options))}
                errors={fieldErrorsAsImmutableSet(this.props.errors.driver_license_state)}
                onBlur={(event) => this.validateDLcombo(this.driversLicenseStateId, event.target.value, this.driversLicenseNumberId, 'driver_license_number')} />

            </div>
            <div className='col-md-12'>
              <InputField gridClassName='col-md-4' id='email'
                value={aboutApplicantFields.email}
                label='Email Address' placeholder=''
                type='text' onChange={(event) => this.props.setParentState('email', event.target.value)} />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

AboutApplicant.propTypes = {
  stateTypes: PropTypes.array.isRequired,
  educationLevels: PropTypes.array.isRequired,
  genderTypes: PropTypes.array.isRequired,
  ethnicityTypes: PropTypes.array.isRequired,
  languageTypes: PropTypes.array.isRequired,
  applicantFields: PropTypes.object.isRequired,
  setParentState: PropTypes.func.isRequired
}

AboutApplicant.defaultProps = {
  idPrefix: '',
  errors: {}
}
