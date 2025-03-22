require 'rails_helper'

RSpec.describe Api::V1::EntriesController, type: :request do
  let(:user) { create(:user) }
  let(:headers) { { 'Authorization' => "Bearer #{user.token}" } }
  
  # Create test entries with different dates and seeds
  let!(:entries) do
    [
      create(:entry, user: user, d: Date.new(2024, 3, 20), seed: 1, prompt: "Test prompt 1", negative_prompt: "Test negative 1", visibility_level: :premium),
      create(:entry, user: user, d: Date.new(2024, 3, 20), seed: 1, prompt: "Test prompt 1", negative_prompt: "Test negative 1", visibility_level: :premium),
      create(:entry, user: user, d: Date.new(2024, 3, 20), seed: 2, prompt: "Test prompt 2", negative_prompt: "Test negative 2", visibility_level: :premium),
      create(:entry, user: user, d: Date.new(2024, 3, 21), seed: 3, prompt: "Test prompt 3", negative_prompt: "Test negative 3", visibility_level: :premium)
    ]
  end

  describe 'GET /api/v1/entries' do
    context 'when listing entries' do
      it 'returns all entries for the user' do
        get '/api/v1/entries', headers: headers
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total_groups']).to eq(3) # 3 unique seeds
        expect(json_response['groups'].length).to eq(3)
        
        # Check that each image in the group has thumbnail_url
        json_response['groups'].each do |group|
          group['images'].each do |image|
            expect(image['thumbnail_url']).to be_present
            expect(image['image_url']).to be_nil
          end
        end
      end

      it 'filters entries by directory (date)' do
        get '/api/v1/entries', params: { directory: '2024-03-20' }, headers: headers
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total_groups']).to eq(2) # 2 unique seeds for 2024-03-20
      end

      it 'filters entries by search term' do
        get '/api/v1/entries', params: { search: 'prompt 1' }, headers: headers
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total_groups']).to eq(1) # Only group with "prompt 1"
      end

      it 'combines directory and search filters' do
        get '/api/v1/entries', params: { directory: '2024-03-20', search: 'prompt 1' }, headers: headers
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total_groups']).to eq(1)
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/entries'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/entries/:id' do
    let(:entry) { entries.first }

    context 'when user has access to the entry' do
      it 'returns the entry details with image URL' do
        get "/api/v1/entries/#{entry.id}", headers: headers
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['image_url']).to eq(entry.image.url)
        expect(json_response['thumbnail_url']).to be_nil
        expect(json_response['id']).to eq(entry.id)
        expect(json_response['seed']).to eq(entry.seed)
        expect(json_response['metadata']['prompt']).to eq(entry.prompt)
        expect(json_response['metadata']['negative_prompt']).to eq(entry.negative_prompt)
        expect(json_response['metadata']['generation_params']).to eq(entry.generation_params)
      end
    end

    context 'when user does not have access to the entry' do
      let(:other_user) { create(:user, subscription_tier: create(:subscription_tier, level: 2)) }
      let(:other_headers) { { 'Authorization' => "Bearer #{other_user.token}" } }

      it 'returns forbidden' do
        get "/api/v1/entries/#{entry.id}", headers: other_headers
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when entry does not exist' do
      it 'returns not found' do
        get '/api/v1/entries/0', headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end 