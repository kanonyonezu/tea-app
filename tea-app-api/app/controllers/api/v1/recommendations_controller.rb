require 'faraday'
require 'json'

class Api::V1::RecommendationsController < ApplicationController
  before_action :authenticate_user!

  def create
    @tea_request = TeaRequest.new(
      user: current_user
    )
    response = Faraday.post("http://localhost:8000/api/v1/recommendations") do |req|
      req.headers["Content-Type"] = "application/json"
      req.body = tea_request_params.to_json
    end

    if response.success?
      teas = []
      teas_data = JSON.parse(response.body)
      teas_data["recommendations"].each do |tea|
        tea_instance = Tea.find_or_create_by(name_en: tea["name_en"])
        tea_instance.update(
          category: tea["category"],
          flavor_primary: tea["flavor_primary"]
        )
        teas << tea_instance
      end
      @tea_request.teas = teas
    end

    if @tea_request.save
      render json: @tea_request, status: :created
    else
      render json: { error: @tea_request.errors.messages}, status: :unprocessable_entity
    end
  end

  def show
    @tea_request = TeaRequest.find(params[:id])
    @teas = @tea_request.teas
    render json: @teas
  end

  private
  def tea_request_params
    params.require(:preferences).permit(:caffeine, :body, flavor: [])
  end
end
