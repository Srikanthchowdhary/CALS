import React from 'react'
import SearchGrid from './search_grid'
import SearchInput from './search_input'
import SearchList from './search_list'
import SearchNotFound from './search_notfount'
import SearchDetails from './search_Data'
import {fetchRequest} from '../helpers/http'
import {urlPrefixHelper} from '../helpers/url_prefix_helper.js.erb'
import {checkforNull} from 'search/common/commonUtils'

export default class Search extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // landingPageUrl: props.landingUrl,
      isToggled: true,
      inputData: props.inputData,
      searchResults: undefined,
      totalNoOfResults: 0,
      pageNumber: props.pageNumber,
      disableNext: this.nextPageLinkStatus(props.total, props.from, props.size),
      disablePrevious: undefined,
      fromValue: props.from,
      sizeValue: props.size
    }
    this.handleToggle = this.handleToggle.bind(this)
    this.searchApiCall = this.searchApiCall.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.changeToNextPage = this.changeToNextPage.bind(this)
    this.backToPreviousPage = this.backToPreviousPage.bind(this)
    this.nextPageLinkStatus = this.nextPageLinkStatus.bind(this)
    this.previousPageLinkStatus = this.previousPageLinkStatus.bind(this)
  }

  handleToggle () {
    this.setState({isToggled: !this.state.isToggled})
  }

  searchApiCall (DataSearch, getFromValue, getSizeValue) {
    const query = DataSearch.split(',')

    const params = {
      'county.value': query[0],
      'type.value': query[1],
      id: query[2],
      name: query[3],
      'addresses.address.street_address': query.slice(4, (query.length)),
      'sort': '_score',
      'order': 'asc'
    }

    // call http request function with arguments
    let url = '/facilities/search' + '?from=' + getFromValue + '&size=' + getSizeValue + '&pageNumber=' + this.state.pageNumber
    fetchRequest(url, 'POST', params).then((response) => {
      return response.json()
    }).then((data) => {
      this.setState({
        inputData: DataSearch,
        searchResults: data.facilities,
        totalNoOfResults: data.total,
        sizeValue: getSizeValue,
        disableNext: this.nextPageLinkStatus(data.total, getFromValue, getSizeValue),
        disablePrevious: this.previousPageLinkStatus(getFromValue, getSizeValue)
      })
    }).catch(error => {
      console.log(error)
      return this.setState({
        searchResults: []
      })
    })
  }

  componentDidMount () {
    this.previousPageLinkStatus(this.state.fromValue, this.state.sizeValue)
    if (this.state.inputData) {
      this.searchApiCall(this.state.inputData, this.state.fromValue, this.state.sizeValue)
    }
  }

  handleChange (facilitiesPerPage) {
    this.setState({
      sizeValue: parseInt(facilitiesPerPage),
      fromValue: 0,
      pageNumber: 1
    }, () => {
      this.searchApiCall(this.state.inputData, this.state.fromValue, this.state.sizeValue)
    })
  }

  nextPageLinkStatus (total, fromValue, sizeValue) {
    return (fromValue + sizeValue >= total || total < 5)
  }

  previousPageLinkStatus (fromValue, sizeValue) {
    if (fromValue - sizeValue < 0 || fromValue === 0) {
      this.setState({
        pageNumber: 1,
        disablePrevious: true
      })
    }
    return (fromValue - sizeValue < 0 || fromValue === 0)
  }

  changeToNextPage (fromValue, sizeValue, pageNumber) {
    this.setState({
      fromValue: fromValue + sizeValue,
      disablePrevious: false,
      pageNumber: pageNumber + 1
    }, () => {
      this.searchApiCall(this.state.inputData, this.state.fromValue, this.state.sizeValue)
    })
  }

  backToPreviousPage (fromValue, sizeValue, pageNumber) {
    this.setState({
      fromValue: fromValue - sizeValue,
      disableNext: false,
      pageNumber: pageNumber - 1
    }, () => {
      this.searchApiCall(this.state.inputData, this.state.fromValue, this.state.sizeValue)
    })
  }

  render () {
    const initialLoad = this.state.searchResults === undefined
    const searchResponseHasValues = this.state.searchResults && this.state.searchResults.length > 0

    return (
      <div className='search_page'>
        <div className='search-section col-xs-12 col-sm-12 col-md-12 col-lg-12'>
          <SearchInput
            searchApiCall={this.searchApiCall.bind(this)}
            countyList={this.props.countyTypes}
            facilityTypes={this.props.facilityTypes}
            countyValue={this.props.countyValue}
            facilityTypeValue={checkforNull(this.props.facilityTypeValue)}
            facilityId={checkforNull(this.props.facilityId)}
            facilityName={checkforNull(this.props.facilityName)}
            facilityAddress={checkforNull(this.props.facilityAddress)}
          />
        </div>
        {searchResponseHasValues &&
          <SearchDetails
            inputData={this.state.inputData}
            totalNoOfFacilities={this.state.totalNoOfResults}
            toggeledResult={this.state.isToggled}
            disablePrevious={this.state.disablePrevious}
            disableNext={this.state.disableNext}
            sizeValue={this.state.sizeValue}
            fromValue={this.state.fromValue}
            pageNumber={this.state.pageNumber}
            searchApiCall={this.searchApiCall.bind(this)}
            handleToggle={this.handleToggle.bind(this)}
            changeToNextPage={this.changeToNextPage.bind(this)}
            backToPreviousPage={this.backToPreviousPage.bind(this)}
            handleChange={this.handleChange.bind(this)} />}
        <div className='result-section col-xs-12 col-sm-12 col-md-12 col-lg-12'>
          {this.state.isToggled && <SearchGrid searchResults={this.state.searchResults} />}
          {!this.state.isToggled && <SearchList searchResults={this.state.searchResults} />}
          {(!searchResponseHasValues && !initialLoad) && <SearchNotFound />}
        </div>
      </div>
    )
  }
}
