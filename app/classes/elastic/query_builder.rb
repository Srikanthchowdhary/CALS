class Elastic::QueryBuilder
  include ActiveModel::Model

  def self.match_and(query_hash)
    # read more about match query here
    # https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html

    # prepare array of match queries.
    a = []

    # each key is an attribute to query on
    query_hash.each {|k, v| a << {match_phrase: {k.to_sym => v}}}

    # wrap array in a bool AND(must)
    return {
      bool: {
        must: a
      }
    }
  end

  def self.sort_query(sort_params, order_params)
    return [
      {
        sort_params =>
        {
          order: order_params
        }
      }
    ]
  end

  # query_array : array of hash - attributes and values to query
  # all keys of a hash will be combined with   AND
  #  each array item will be combined with  OR
  #
  # input [ {fac_co_nbr: '23', fac_name: 'home'}, {fac_co_nbr: '45'} ]
  # translates to  (fac_co_nbr: 23 AND fac_name: home) OR (fac_co_nbr: 45)
  # returns:
  # {"query":{"bool":{"should":[{"bool":{"must":[{"match":{"fac_co_nbr":"28"}},{"match":{"fac_name":"home"}}]}},{"bool":{"must":[{"match":{"fac_co_nbr":"18"}}]}}]}}}
  #
  def self.match_boolean(query_array, page_params)

    if page_params['sort_params'].nil? && page_params['order_params'].nil?
      final_sort_query = []
    else
      final_sort_query = sort_query(page_params['sort_params'], page_params['order_params'])
    end

    # prepare array of match queries.
    combined_query_array = []

    # loop through each array item to create piece of query
    query_array.each do |itm|
      # combined_query_array << address_query(itm.delete('addresses.address.street_address')) if itm['addresses.address.street_address'].present?
      combined_query_array << match_and(itm)
    end
    # wrap array in a bool OR query
    return {
      query: {
        bool: {
          should: combined_query_array
        }
      },
      from: page_params['from_params'],
      size: page_params['size_params'],
      sort: final_sort_query
    }
  end

  def self.facility_search_v1(query_array, page_params)
    address_params = query_array.map {|param| param['addresses.address.street_address']}.first
    if address_params
      query_array_without_address = [query_array.first.except('addresses.address.street_address')]
      search_query = match_boolean(query_array_without_address, page_params)
      search_query[:query][:bool][:should].first[:bool][:must] << address_query(address_params)
      return search_query
    else
      match_boolean(query_array, page_params)
    end
  end

  def self.address_query(address_params)
    return {
      nested: {
        path: 'addresses',
        score_mode: 'avg',
        query: {
          multi_match: {
            query: address_params,
            type: 'phrase',
            fields: ['addresses.address.street_address', 'addresses.address.state', 'addresses.address.city', 'addresses.address.zip_code']
          }
        }
      }
    }
  end
end
