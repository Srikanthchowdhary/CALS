class FacilitiesController < CalsBaseController

  include Response

  def index
    #  @race_types = Helpers::Dictionaries::RaceTypeHelper.new(auth_header: 'abc').all
    # byebug

    @facilities = facility_helper.all
  end

  def show
    @facility = facility_helper.find_by_id(params[:id])
    @children = child_helper.find_by_facility(params[:id])
    @complaints = complaint_helper.find_by_facility(params[:id])
    #@facility = @facility
  end

  def search
    store_in_session(params)
    page_params = {}
    page_params['size_params'] = params[:size]
    page_params['from_params'] = params[:from]
    page_params['sort_params'] = params[:sort]
    page_params['order_params'] = params[:order]
    post_data = request.body.read
    parsed_post_data = JSON.parse(post_data)
    params_dictionary = {}
    parsed_post_data.each do |k, v|
      if k == 'addresses.address.street_address'
        params_dictionary[k] = v
      else
        params_dictionary[k] = [v]
      end
    end
    query_hash = QueryPreprocessor.params_to_query_hash(params_dictionary)
    logger.info "query_hash: #{query_hash}"
    es_query_json = Elastic::QueryBuilder.facility_search_v1(query_hash, page_params).to_json
    logger.info "es query: #{es_query_json}"
    @facilities = facility_helper.search es_query_json
    @facilities_response = {}
    @facilities_response['facilities'] = @facilities['hits']['hits'].collect { |facility| facility['_source']}
    @facilities_response['facilities'].sort_by! {|facility_name| facility_name['name']}
    @facilities_response['total'] = @facilities['hits']['total']
    #store_facility_response_in_session
    json_response @facilities_response
  end

  # def store_facility_response_in_session
  #   session[:facility_response] = @facilities_response['facilities']
  #   session[:total] = @facilities_response['total'].to_i
  # end

  def store_in_session(params)
    session[:from] = params['from'].to_i
    session[:size] = params['size'].to_i
    session[:page_number] = params['pageNumber'].to_i
    session[:county_value] = params['county.value']
    session[:facility_type] = params['type.value']
    session[:facility_id] = params['id']
    session[:facility_name] = params['name']
    session[:facility_address] = params['addresses.address.street_address']
    session[:input_data] = [params['county.value'], params['type.value'], params['id'], params['name'], params['addresses.address.street_address']].join(',')
  end

  private

  def facility_helper
    Helpers::Facility.new(auth_header: get_session_token)
  end

  def child_helper
    Helpers::Child.new(auth_header: get_session_token)
  end

  def complaint_helper
    Helpers::Complaint.new(auth_header: get_session_token)
  end
end
