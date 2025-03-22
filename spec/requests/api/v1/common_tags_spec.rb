require 'rails_helper'

RSpec.describe "Api::V1::CommonTags", type: :request do
  let(:user) { create(:user) }
  let(:headers) { { 'Authorization' => "Bearer #{user.token}" } }

  describe "GET /api/v1/common-tags" do
    context "when user is authenticated" do
      context "when there are common tags" do
        let!(:tag1) { create(:common_tag, user: user, name: "portrait", count: 150) }
        let!(:tag2) { create(:common_tag, user: user, name: "landscape", count: 120) }
        let!(:tag3) { create(:common_tag, user: user, name: "high quality", count: 200) }
        let!(:other_user_tag) { create(:common_tag, name: "other user tag") }

        it "returns http success" do
          get "/api/v1/common-tags", headers: headers
          expect(response).to have_http_status(:success)
        end

        it "returns only user's tags" do
          get "/api/v1/common-tags", headers: headers
          json_response = JSON.parse(response.body)
          expect(json_response["tags"].length).to eq(3)
          expect(json_response["tags"].map { |t| t["name"] }).to include("portrait", "landscape", "high quality")
        end

        it "returns tags ordered by count in descending order" do
          get "/api/v1/common-tags", headers: headers
          json_response = JSON.parse(response.body)
          tags = json_response["tags"]
          expect(tags.first["count"]).to eq(200)  # "high quality"
          expect(tags.second["count"]).to eq(150) # "portrait"
          expect(tags.third["count"]).to eq(120)  # "landscape"
        end

        it "includes all required fields for each tag" do
          get "/api/v1/common-tags", headers: headers
          json_response = JSON.parse(response.body)
          tag = json_response["tags"].first
          expect(tag).to include(
            "id",
            "name",
            "count",
            "user_id",
            "created_at",
            "updated_at"
          )
        end
      end

      context "when there are no common tags" do
        it "returns empty tags array" do
          get "/api/v1/common-tags", headers: headers
          json_response = JSON.parse(response.body)
          expect(json_response["tags"]).to be_empty
        end
      end
    end

    context "when user is not authenticated" do
      it "returns unauthorized status" do
        get "/api/v1/common-tags"
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Unauthorized")
      end
    end

    context "when an error occurs" do
      before do
        allow(CommonTag).to receive(:where).and_raise(StandardError.new("Database error"))
      end

      it "returns error response with 500 status" do
        get "/api/v1/common-tags", headers: headers
        expect(response).to have_http_status(:internal_server_error)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key("error")
        expect(json_response["error"]).to eq("Database error")
      end
    end
  end
end
