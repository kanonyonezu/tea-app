class Api::V1::RecommendationsController < ApplicationController
  before_action :authenticate_user!

  def create
    @tea_request = TeaRequest.new(
      user: current_user
    )
    @tea_request.teas = Tea.where("flavor_primary = ?", tea_request_params[:flavor])

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
    params.require(:preferences).permit(:sweetness, mood: [], flavor: [])
  end
end
