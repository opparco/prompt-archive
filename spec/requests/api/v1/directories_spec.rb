require 'rails_helper'

RSpec.describe Api::V1::DirectoriesController, type: :request do
  let(:user) { create(:user) }
  let(:headers) { { 'Authorization' => "Bearer #{user.token}" } }
  
  # Create test entries with different dates
  let!(:entries) do
    [
      create(:entry, user: user, d: Date.new(2024, 3, 20)),
      create(:entry, user: user, d: Date.new(2024, 3, 21))
    ]
  end

  describe 'GET /api/v1/directories' do
    context 'when listing directories' do
      it 'returns all unique dates for the user' do
        get '/api/v1/directories', headers: headers
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['directories']).to match_array(['2024-03-21', '2024-03-20'])
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/directories'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end 