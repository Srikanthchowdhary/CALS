require 'rspec'
require 'rails_helper'

describe FacilitiesController do

  describe "Build query" do
    it "builds simple bool AND" do

      expected_output = {
        bool: {
          must: [
            { match_phrase: {'fac_co_nbr':'28'} },
            { match_phrase:{'fac_name':'home'} }
          ]
      }}

      input = {fac_co_nbr: '28', fac_name: 'home'}
      output = Elastic::QueryBuilder.match_and(input)

      expect(output).to eq(expected_output)
    end

    it "builds complex bool AND/OR" do

      expected_output = {
        query: {
          bool: {
            should: [
              {bool:
               {must: [
                  {match_phrase:{'fac_co_nbr':'28'}},
                  {match_phrase:{'fac_name':'home'}}
                ]
                }
               }]
          }
        },
        from: '0',
        size: '5' ,
        sort: [
          {
            '_score' =>
            {
              order: 'asc'
            }
          }
        ]
      }

      input = [{"fac_co_nbr"=>"28", "fac_name"=>"home"}]
      page_param = {"size_params"=>"5", "from_params"=>"0", "sort_params"=>"_score", "order_params"=>"asc"}
      output = Elastic::QueryBuilder.match_boolean(input, page_param)
      expect(output).to eq(expected_output)
    end

  end

end
