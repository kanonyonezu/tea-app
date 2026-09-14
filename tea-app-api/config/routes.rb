Rails.application.routes.draw do
  devise_for :users

  # /api/v1/teas
  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :teas, only: [:index]
      post "/recommendation", to: "teas#recommendation", as: :tea_recommendation
    end
  end

end
