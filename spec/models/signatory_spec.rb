require 'rspec'
require 'rails_helper'

include RSpec

describe Signatory do
  it 'builds a default signatory' do
    signatory = FactoryGirl.build(:signatory, city: 'test')
   expect(signatory.city).to eq('test')
  end
end
