class Api::V1::TeasController < ApplicationController
  def index
    @teas = Tea.all

    render json: @teas.order(name_en: :asc)
  end

  def show
    @tea = Tea.find(params[:id])
    render json: @tea
  end

  # this is not needed
  def recommendation
    @tea_request = TeaRequest.new(tea_params)
    if @tea_request.save
      render json: @tea_request, status: :created
    else
      render json: { error: @tea_request.errors.messages}, status: :unprocessable_entity
    end
  end

  private

  def tea_params
    params.require(:preference).permit(:category, :flavor)
  end
end
